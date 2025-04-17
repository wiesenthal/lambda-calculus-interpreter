/**
 * Lambda Calculus Interpreter - REPL
 */

import * as readline from 'readline';
import { LambdaCalculus } from './index';

class LambdaCalculusREPL {
  private lc: LambdaCalculus;
  private rl: readline.Interface;
  private definitions: Record<string, string> = {};

  constructor() {
    this.lc = new LambdaCalculus();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'λ> '
    });

    // Add some common predefined terms
    this.addPreDefinitions();
  }

  private addPreDefinitions(): void {
    // Church booleans
    this.definitions['true'] = '\\x.\\y.x';
    this.definitions['false'] = '\\x.\\y.y';
    
    // Church numerals
    this.definitions['0'] = '\\f.\\x.x';
    this.definitions['1'] = '\\f.\\x.f x';
    this.definitions['2'] = '\\f.\\x.f (f x)';
    this.definitions['3'] = '\\f.\\x.f (f (f x))';
    
    // Church combinators
    this.definitions['I'] = '\\x.x';                              // Identity
    this.definitions['K'] = '\\x.\\y.x';                          // Constant / true
    this.definitions['S'] = '\\x.\\y.\\z.x z (y z)';              // Substitution
    this.definitions['Y'] = '\\f.(\\x.f (x x)) (\\x.f (x x))';    // Y combinator (fixed-point)
    
    // Boolean operations
    this.definitions['and'] = '\\p.\\q.p q p';                    // AND: λp.λq.p q p
    this.definitions['or'] = '\\p.\\q.p p q';                     // OR: λp.λq.p p q
    this.definitions['not'] = '\\p.\\a.\\b.p b a';                // NOT: λp.λa.λb.p b a
  }

  private printHelp(): void {
    console.log('\nLambda Calculus Interpreter Help:');
    console.log('  :help                 - Show this help message');
    console.log('  :quit                 - Exit the REPL');
    console.log('  :def <name> <expr>    - Define a named expression');
    console.log('  :defs                 - List all definitions');
    console.log('  :steps <expr>         - Show evaluation steps');
    console.log('  :clear                - Clear all definitions');
    console.log('  <expression>          - Evaluate a lambda expression\n');
    console.log('Lambda Expression Syntax:');
    console.log('  \\x.e                  - Lambda abstraction (can also use λ)');
    console.log('  (e1 e2)               - Application (parentheses optional in some cases)');
    console.log('  x, y, z, ...          - Variables\n');
    console.log('Examples:');
    console.log('  \\x.x                  - Identity function');
    console.log('  (\\x.x) y              - Apply identity to y');
    console.log('  (\\x.\\y.x) a b         - Apply function to multiple arguments\n');
  }

  private expandDefinitions(expr: string): string {
    let result = expr;
    for (const [name, def] of Object.entries(this.definitions)) {
      // Only replace when the name is a whole word (not part of another word)
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      result = result.replace(regex, `(${def})`);
    }
    return result;
  }

  public start(): void {
    console.log('Lambda Calculus Interpreter');
    console.log('Type :help for instructions or :quit to exit');
    this.rl.prompt();

    this.rl.on('line', (line) => {
      try {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          // Empty line, just show prompt again
          this.rl.prompt();
          return;
        }

        if (trimmedLine === ':help') {
          this.printHelp();
        } else if (trimmedLine === ':quit') {
          this.rl.close();
          return;
        } else if (trimmedLine === ':defs') {
          console.log('\nDefined terms:');
          for (const [name, def] of Object.entries(this.definitions)) {
            console.log(`  ${name} = ${def}`);
          }
          console.log('');
        } else if (trimmedLine === ':clear') {
          this.definitions = {};
          this.addPreDefinitions();
          console.log('All user definitions cleared.');
        } else if (trimmedLine.startsWith(':def ')) {
          const parts = trimmedLine.substring(5).trim().split(' ');
          if (parts.length >= 2) {
            const name = parts[0];
            const expr = parts.slice(1).join(' ');
            
            // Validate the expression by parsing it
            try {
              const expandedExpr = this.expandDefinitions(expr);
              this.lc.parse(expandedExpr);
              this.definitions[name] = expr;
              console.log(`Defined ${name} = ${expr}`);
            } catch (error) {
              console.error(`Error in definition: ${(error as Error).message}`);
            }
          } else {
            console.error('Usage: :def <name> <expression>');
          }
        } else if (trimmedLine.startsWith(':steps ')) {
          const expr = trimmedLine.substring(7).trim();
          const expandedExpr = this.expandDefinitions(expr);
          const { steps } = this.lc.evaluateWithSteps(expandedExpr);
          
          console.log('\nEvaluation steps:');
          steps.forEach((step, i) => {
            console.log(`  ${i}: ${step.expression}`);
          });
          console.log('');
        } else {
          // Evaluate expression
          try {
            const expandedExpr = this.expandDefinitions(trimmedLine);
            const result = this.lc.evaluate(expandedExpr);
            console.log(this.lc.formatExpression(result));
          } catch (error) {
            console.error(`Error: ${(error as Error).message}`);
          }
        }
      } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
      }
      
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\nGoodbye!');
      process.exit(0);
    });
  }
}

// Start the REPL
if (require.main === module) {
  const repl = new LambdaCalculusREPL();
  repl.start();
} 
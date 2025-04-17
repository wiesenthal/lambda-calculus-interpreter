/**
 * Lambda Calculus Interpreter - Main Entry Point
 */

import { Lexer } from './lexer';
import { Parser } from './parser';
import { Interpreter } from './interpreter';
import { Node } from './ast';

export class LambdaCalculus {
  private interpreter: Interpreter;

  constructor() {
    this.interpreter = new Interpreter();
  }

  public parse(input: string): Node {
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
  }

  public evaluate(input: string, maxSteps: number = 1000): Node {
    const ast = this.parse(input);
    return this.interpreter.evaluate(ast, maxSteps);
  }

  public formatExpression(node: Node): string {
    return this.interpreter.toString(node);
  }

  public evaluateWithSteps(input: string, maxSteps: number = 1000): { result: Node, steps: Array<{ expression: string }> } {
    const ast = this.parse(input);
    const steps: Array<{ expression: string }> = [];
    
    steps.push({ expression: this.formatExpression(ast) });
    
    let current = ast;
    let stepCount = 0;
    
    while (stepCount < maxSteps) {
      const result = this.interpreter.step(current);
      if (result === null) {
        // No reduction occurred, we reached normal form
        break;
      }
      current = result;
      steps.push({ expression: this.formatExpression(current) });
      stepCount++;
    }
    
    if (stepCount >= maxSteps) {
      throw new Error(`Evaluation exceeded maximum steps (${maxSteps}). Possible non-terminating expression.`);
    }
    
    return { result: current, steps };
  }
}

// Example usage
if (require.main === module) {
  const lc = new LambdaCalculus();
  
  // Try some examples
  const examples = [
    // Identity function
    '\\x.x',
    
    // Apply identity to a variable
    '(\\x.x) y',
    
    // Self-application
    '(\\x.x x) (\\y.y)',
    
    // Church encoding of true: λx.λy.x
    '\\x.\\y.x',
    
    // Church encoding of false: λx.λy.y
    '\\x.\\y.y',
    
    // Church numeral 1: λf.λx.f x
    '\\f.\\x.f x',
    
    // Church numeral 2: λf.λx.f (f x)
    '\\f.\\x.f (f x)',
    
    // Y combinator: λf.(λx.f (x x)) (λx.f (x x))
    '\\f.(\\x.f (x x)) (\\x.f (x x))'
  ];

  for (const example of examples) {
    console.log(`\nInput: ${example}`);
    try {
      const { result, steps } = lc.evaluateWithSteps(example);
      console.log('Steps:');
      steps.forEach((step, i) => {
        console.log(`  ${i}: ${step.expression}`);
      });
      console.log(`Result: ${lc.formatExpression(result)}`);
    } catch (error) {
      console.error(`Error: ${(error as Error).message}`);
    }
  }
} 
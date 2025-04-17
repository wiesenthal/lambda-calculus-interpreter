/**
 * Lambda Calculus Interpreter
 */

import { Node, NodeType, Variable, Abstraction, Application, variable, abstraction, application } from './ast';

export class Interpreter {
  // Check if a variable is free in an expression
  private isFreeIn(name: string, node: Node): boolean {
    switch (node.type) {
      case NodeType.Variable:
        return (node as Variable).name === name;
      case NodeType.Abstraction:
        const abs = node as Abstraction;
        return abs.param !== name && this.isFreeIn(name, abs.body);
      case NodeType.Application:
        const app = node as Application;
        return this.isFreeIn(name, app.left) || this.isFreeIn(name, app.right);
    }
  }

  // Generate a fresh variable name that doesn't conflict with existing variables
  private freshVarName(usedName: string, node: Node): string {
    let newName = usedName + "'";
    while (this.isFreeIn(newName, node)) {
      newName += "'";
    }
    return newName;
  }

  // Substitute a variable with an expression in the given node
  private substitute(node: Node, varName: string, replacement: Node): Node {
    switch (node.type) {
      case NodeType.Variable:
        const varNode = node as Variable;
        if (varNode.name === varName) {
          return replacement;
        }
        return varNode;

      case NodeType.Abstraction:
        const absNode = node as Abstraction;
        // If the abstraction binds the same variable, don't substitute in its body
        if (absNode.param === varName) {
          return absNode;
        }
        
        // Check if the parameter of the abstraction would capture a free variable in the replacement
        if (this.isFreeIn(absNode.param, replacement) && this.isFreeIn(varName, absNode.body)) {
          // Alpha conversion needed to avoid variable capture
          const freshName = this.freshVarName(absNode.param, replacement);
          const newBody = this.substitute(absNode.body, absNode.param, variable(freshName));
          return abstraction(
            freshName,
            this.substitute(newBody, varName, replacement)
          );
        } else {
          // No variable capture, substitute directly
          return abstraction(
            absNode.param,
            this.substitute(absNode.body, varName, replacement)
          );
        }

      case NodeType.Application:
        const appNode = node as Application;
        return application(
          this.substitute(appNode.left, varName, replacement),
          this.substitute(appNode.right, varName, replacement)
        );
    }
  }

  // Apply a function to an argument (beta reduction)
  private betaReduce(func: Abstraction, arg: Node): Node {
    return this.substitute(func.body, func.param, arg);
  }

  // Evaluate a lambda expression to its normal form
  public evaluate(node: Node, maxSteps: number = 1000): Node {
    let current = node;
    let steps = 0;

    while (steps < maxSteps) {
      const result = this.step(current);
      if (result === null) {
        // No reduction occurred, we reached normal form
        return current;
      }
      current = result;
      steps++;
    }

    throw new Error(`Evaluation exceeded maximum steps (${maxSteps}). Possible non-terminating expression.`);
  }

  // Perform a single evaluation step (returns null if no reduction possible)
  public step(node: Node): Node | null {
    switch (node.type) {
      case NodeType.Variable:
        // Variables are already in normal form
        return null;

      case NodeType.Abstraction:
        // Try to reduce the body of the abstraction
        const abs = node as Abstraction;
        const reducedBody = this.step(abs.body);
        if (reducedBody === null) {
          return null;
        }
        return abstraction(abs.param, reducedBody);

      case NodeType.Application:
        const app = node as Application;
        // First, try to reduce the left side (the function)
        const reducedLeft = this.step(app.left);
        if (reducedLeft !== null) {
          return application(reducedLeft, app.right);
        }

        // If the left side is already in normal form, try to reduce the right side (the argument)
        const reducedRight = this.step(app.right);
        if (reducedRight !== null) {
          return application(app.left, reducedRight);
        }

        // If both sides are in normal form, check if we can perform a beta reduction
        if (app.left.type === NodeType.Abstraction) {
          return this.betaReduce(app.left as Abstraction, app.right);
        }

        // No reductions possible
        return null;
    }
  }

  // Convert a node to its string representation
  public toString(node: Node): string {
    switch (node.type) {
      case NodeType.Variable:
        return (node as Variable).name;
      case NodeType.Abstraction:
        const abs = node as Abstraction;
        return `(λ${abs.param}.${this.toString(abs.body)})`;
      case NodeType.Application:
        const app = node as Application;
        // For better readability, add parentheses only where needed
        const left = this.toString(app.left);
        const right = this.toString(app.right);
        const leftStr = app.left.type === NodeType.Application ? left : left;
        const rightStr = app.right.type === NodeType.Variable ? right : `(${right})`;
        return `${leftStr} ${rightStr}`;
    }
  }
} 
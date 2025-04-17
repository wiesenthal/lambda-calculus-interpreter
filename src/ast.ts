/**
 * Lambda Calculus AST types
 */

export enum NodeType {
  Variable = 'Variable',
  Abstraction = 'Abstraction',
  Application = 'Application'
}

export interface Node {
  type: NodeType;
}

export interface Variable extends Node {
  type: NodeType.Variable;
  name: string;
}

export interface Abstraction extends Node {
  type: NodeType.Abstraction;
  param: string;
  body: Node;
}

export interface Application extends Node {
  type: NodeType.Application;
  left: Node;
  right: Node;
}

// Helper functions to create AST nodes
export function variable(name: string): Variable {
  return { type: NodeType.Variable, name };
}

export function abstraction(param: string, body: Node): Abstraction {
  return { type: NodeType.Abstraction, param, body };
}

export function application(left: Node, right: Node): Application {
  return { type: NodeType.Application, left, right };
} 
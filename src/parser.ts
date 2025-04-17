/**
 * Lambda Calculus Parser
 */

import { Token, TokenType } from './lexer';
import { Node, NodeType, variable, abstraction, application } from './ast';

export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    
    const token = this.peek();
    throw new Error(`${message} at position ${token.position}`);
  }

  public parse(): Node {
    try {
      return this.expression();
    } catch (error) {
      throw error;
    }
  }

  private expression(): Node {
    return this.application();
  }

  private application(): Node {
    let expr = this.atom();

    while (!this.isAtEnd() && !this.check(TokenType.RParen) && !this.check(TokenType.Dot)) {
      const right = this.atom();
      expr = application(expr, right);
    }

    return expr;
  }

  private atom(): Node {
    // Lambda abstraction
    if (this.match(TokenType.Lambda)) {
      const param = this.consume(TokenType.Variable, "Expected parameter name after lambda");
      this.consume(TokenType.Dot, "Expected '.' after parameter name in lambda abstraction");
      const body = this.expression();
      return abstraction(param.value!, body);
    }

    // Variable
    if (this.match(TokenType.Variable)) {
      return variable(this.previous().value!);
    }

    // Parenthesized expression
    if (this.match(TokenType.LParen)) {
      const expr = this.expression();
      this.consume(TokenType.RParen, "Expected ')' after expression");
      return expr;
    }

    throw new Error(`Unexpected token: ${this.peek().type} at position ${this.peek().position}`);
  }
} 
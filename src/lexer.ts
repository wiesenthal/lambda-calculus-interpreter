/**
 * Lambda Calculus Lexer
 */

export enum TokenType {
  Lambda = 'Lambda',
  Variable = 'Variable',
  Dot = 'Dot',
  LParen = 'LParen',
  RParen = 'RParen',
  EOF = 'EOF'
}

export interface Token {
  type: TokenType;
  value?: string;
  position: number;
}

export class Lexer {
  private input: string;
  private position: number = 0;
  private readonly inputLength: number;

  constructor(input: string) {
    this.input = input.trim();
    this.inputLength = this.input.length;
  }

  private isAtEnd(): boolean {
    return this.position >= this.inputLength;
  }

  private peek(): string {
    if (this.isAtEnd()) return '';
    return this.input[this.position];
  }

  private advance(): string {
    if (this.isAtEnd()) return '';
    return this.input[this.position++];
  }

  private isAlpha(c: string): boolean {
    return /[a-zA-Z]/.test(c);
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || /[0-9]/.test(c);
  }

  private readVariable(): string {
    const start = this.position;
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    return this.input.substring(start, this.position);
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd()) {
      const c = this.peek();
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
        this.advance();
      } else {
        break;
      }
    }
  }

  public nextToken(): Token {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      return { type: TokenType.EOF, position: this.position };
    }

    const currentPosition = this.position;
    const c = this.advance();

    switch (c) {
      case '\\':
      case 'λ':
        return { type: TokenType.Lambda, position: currentPosition };
      case '.':
        return { type: TokenType.Dot, position: currentPosition };
      case '(':
        return { type: TokenType.LParen, position: currentPosition };
      case ')':
        return { type: TokenType.RParen, position: currentPosition };
      default:
        if (this.isAlpha(c)) {
          this.position = currentPosition;
          const variable = this.readVariable();
          return {
            type: TokenType.Variable,
            value: variable,
            position: currentPosition
          };
        }
        throw new Error(`Unexpected character: ${c} at position ${currentPosition}`);
    }
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (true) {
      const token = this.nextToken();
      tokens.push(token);
      if (token.type === TokenType.EOF) {
        break;
      }
    }
    return tokens;
  }
} 
# Lambda Calculus Interpreter

A pure TypeScript implementation of a lambda calculus interpreter.

## Overview

This project implements a lambda calculus interpreter with:
- Lexer for tokenizing lambda calculus expressions
- Parser for building abstract syntax trees
- Interpreter for evaluating expressions through beta reduction
- Support for alpha conversion to avoid variable capture
- REPL (Read-Eval-Print-Loop) for interactive use

## Getting Started

### Installation

```bash
git clone https://github.com/wiesenthal/lambda-calculus-interpreter.git
cd lambda-calculus-interpreter
npm install
```

### Running the Interpreter

To start the interactive REPL:

```bash
npm run dev
```

To run the example expressions:

```bash
npm start
```

To build the project:

```bash
npm run build
```

## Lambda Calculus Syntax

The interpreter supports the following syntax:

- `\x.e` or `λx.e` - Lambda abstraction (a function with parameter x and body e)
- `(e1 e2)` - Application (applying e1 to e2)
- Variables are represented by alphabetic characters

### Examples

- Identity function: `\x.x`
- Apply identity to y: `(\x.x) y`
- Church encoding for true: `\x.\y.x`
- Church encoding for false: `\x.\y.y`
- Church numeral 1: `\f.\x.f x`
- Y combinator: `\f.(\x.f (x x)) (\x.f (x x))`

## REPL Commands

In the interactive REPL, you can use the following commands:

- `:help` - Show help message
- `:quit` - Exit the REPL
- `:def <name> <expr>` - Define a named expression
- `:defs` - List all predefined and user-defined terms
- `:steps <expr>` - Show evaluation steps for an expression
- `:clear` - Clear all user definitions
- Any lambda calculus expression will be evaluated

## Predefined Terms

The interpreter comes with several predefined terms:

- Church booleans: `true`, `false`
- Church numerals: `0`, `1`, `2`, `3`
- Church combinators: `I` (identity), `K` (constant), `S` (substitution), `Y` (fixed-point)
- Boolean operations: `and`, `or`, `not`

## Implementation Details

The project structure:

- `src/ast.ts` - Abstract Syntax Tree definitions
- `src/lexer.ts` - Tokenizer for lambda calculus expressions
- `src/parser.ts` - Parser that builds AST from tokens
- `src/interpreter.ts` - Evaluator that performs alpha conversion and beta reduction
- `src/index.ts` - Main entry point and examples
- `src/repl.ts` - Interactive Read-Eval-Print-Loop

## License

ISC 
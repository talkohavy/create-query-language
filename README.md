# Create Query Language

> A flexible TypeScript library for parsing and building query languages with support for lexical analysis, AST generation, and token stream processing.

![Demo Image Placeholder](./demo-image-placeholder.png)

[![npm version](https://badge.fury.io/js/create-query-language.svg)](https://badge.fury.io/js/create-query-language)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Coverage Status](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://github.com/talkohavy/create-query-language)

## ✨ Features

- 🚀 **Fast and Lightweight** - Built with performance in mind using TypeScript
- 🔍 **Flexible Query Syntax** - Support for boolean logic, comparisons, and grouping
- 🎯 **Type Safe** - Full TypeScript support with comprehensive type definitions  
- 🌳 **AST Generation** - Generate Abstract Syntax Trees for complex query processing
- 🔧 **Extensible** - Modular architecture allows for easy customization
- 📊 **Token Stream Processing** - Low-level access to token streams for advanced use cases
- ⚡ **Zero Dependencies** - Lightweight with no external runtime dependencies
- 🧪 **Well Tested** - 90%+ test coverage with comprehensive edge case handling

## 📦 Installation

```bash
# Using npm
npm install create-query-language

# Using yarn
yarn add create-query-language

# Using pnpm
pnpm add create-query-language
```

## 🚀 Quick Start

```typescript
import { QueryParser, QueryLexer, ASTBuilder } from 'create-query-language';

// Basic parsing
const parser = new QueryParser();
const result = parser.parse('status: active AND role: admin');

if (result.success) {
  console.log('Query parsed successfully!');
  console.log('AST:', result.ast);
} else {
  console.error('Parse errors:', result.errors);
}
```

## 📖 Usage Examples

### Basic Query Parsing

```typescript
import { QueryParser } from 'create-query-language';

const parser = new QueryParser();

// Simple condition
const result1 = parser.parse('status: active');

// Boolean expressions
const result2 = parser.parse('status: active AND role: admin');
const result3 = parser.parse('type: user OR type: admin');

// Grouped expressions
const result4 = parser.parse('(status: active OR status: pending) AND role: admin');

// Different comparators
const result5 = parser.parse('age >= 18 AND score > 85');
```

### Lexical Analysis

```typescript
import { QueryLexer } from 'create-query-language';

const lexer = new QueryLexer();
const tokens = lexer.tokenize('status: "active user" AND (role: admin OR role: manager)');

tokens.forEach(token => {
  console.log(`${token.type}: "${token.value}" at position ${token.position.start}-${token.position.end}`);
});
```

### AST Manipulation

```typescript
import { ASTBuilder } from 'create-query-language';

// Create AST nodes programmatically
const key = ASTBuilder.createKey('status', { start: 0, end: 6 });
const comparator = ASTBuilder.createComparator(':', { start: 6, end: 7 });
const value = ASTBuilder.createValue('active', { start: 8, end: 14 });

const condition = ASTBuilder.createCondition(
  key, 
  comparator, 
  value, 
  0, 1, 0, // spacing information
  { start: 0, end: 14 }
);

// Traverse AST
ASTBuilder.traverseAST(condition, null, (node) => {
  console.log(`Visiting node: ${node.type}`);
  return true; // continue traversal
});
```

### Token Stream Processing

```typescript
import { TokenStream } from 'create-query-language';

const tokens = lexer.tokenize('status: active AND role: admin');
const stream = new TokenStream(tokens);

while (!stream.isAtEnd()) {
  const current = stream.current();
  console.log(`Current token: ${current?.type}`);
  
  if (current?.type === 'IDENTIFIER') {
    console.log(`Found identifier: ${current.value}`);
  }
  
  stream.consume();
}
```

## 🎯 Supported Query Syntax

### Basic Conditions
```
field: value
name: "John Doe"
age: 25
```

### Comparators
```
age >= 18          # Greater than or equal
score > 85         # Greater than
count <= 100       # Less than or equal
priority < 5       # Less than
status == active   # Equals
type != guest      # Not equals
field: value       # Colon (default)
```

### Boolean Operators
```
status: active AND role: admin           # AND operation
type: user OR type: admin               # OR operation
status: active AND (role: admin OR role: manager)  # Grouped expressions
```

### Quoted Strings
```
name: "John Doe"                        # Double quotes
title: 'Software Engineer'              # Single quotes
message: "He said \"Hello\""            # Escaped quotes
```

### Grouping
```
(status: active)                        # Simple group
(status: active OR status: pending) AND role: admin  # Complex grouping
((field: value))                        # Nested groups
```

## 🔧 API Reference

### QueryParser

The main parser class for converting query strings into AST.

```typescript
class QueryParser {
  constructor(options?: Partial<QueryParserOptions>);
  parse(input: string): ParseResult;
}

interface ParseResult {
  success: boolean;
  ast?: QueryExpression;
  errors: ParseError[];
  tokens: Token[];
}
```

### QueryLexer

Tokenizes input strings into a sequence of tokens.

```typescript
class QueryLexer {
  constructor(options?: Partial<QueryLexerOptions>);
  tokenize(input: string): Token[];
}

interface Token {
  type: TokenTypeValues;
  value: string;
  position: Position;
}
```

### ASTBuilder

Utility class for creating and manipulating AST nodes.

```typescript
class ASTBuilder {
  static createQuery(expression: Expression, position: Position): QueryExpression;
  static createCondition(/* ... */): ConditionExpression;
  static createBooleanExpression(/* ... */): BooleanExpression;
  static createGroup(expression: Expression, position: Position): GroupExpression;
  static traverseAST(node: Expression, parentNode: Expression | null, callback: TraversalCallback): void;
  static mergePositions(...positions: Position[]): Position;
}
```

### TokenStream

Provides a stream-like interface for processing tokens.

```typescript
class TokenStream {
  constructor(tokens: Token[], options?: Partial<TokenContext>);
  current(): Token | null;
  consume(): Token | null;
  expect(expectedType: TokenTypeValues): Token;
  isCurrentAMatchWith(types: TokenTypeValues[]): boolean;
  matchAny(types: TokenTypeValues[]): Token | null;
  countAndSkipWhitespaces(): number;
  isAtEnd(): boolean;
}
```

## ⚙️ Configuration

### Parser Options

```typescript
interface QueryParserOptions {
  maxErrors: number;  // Maximum number of errors to collect (default: unlimited)
}

const parser = new QueryParser({ maxErrors: 5 });
```

### Lexer Options

```typescript
interface QueryLexerOptions {
  // Lexer configuration options
  // Add custom options as needed
}

const lexer = new QueryLexer(/* options */);
```

## 🎨 Advanced Usage

### Custom Error Handling

```typescript
const result = parser.parse('invalid query syntax');

if (!result.success) {
  result.errors.forEach(error => {
    console.error(`Error at position ${error.position.start}: ${error.message}`);
  });
}
```

### Position Tracking

```typescript
const tokens = lexer.tokenize('field: value');

tokens.forEach(token => {
  console.log(`Token "${token.value}" spans from ${token.position.start} to ${token.position.end}`);
  console.log(`Line: ${token.position.line}, Column: ${token.position.column}`);
});
```

### AST Traversal with Custom Logic

```typescript
// Find all field names in a query
const fieldNames: string[] = [];

ASTBuilder.traverseAST(ast.expression, null, (node) => {
  if (node.type === 'key') {
    fieldNames.push(node.value);
  }
  return true; // continue traversal
});

console.log('Fields used in query:', fieldNames);
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Building

Build the library:

```bash
# Clean and build
npm run build

# Type checking
npm run tsc

# Linting
npm run lint
npm run lint:fix
```

## 📊 Coverage

Current test coverage: **90%+**

- ✅ Statements: 90.38%
- ✅ Branches: 79.57%  
- ✅ Functions: 98.33%
- ✅ Lines: 90.98%

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/create-query-language.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes and add tests
6. Run tests: `npm test`
7. Build the project: `npm run build`
8. Commit your changes: `git commit -m 'Add some amazing feature'`
9. Push to the branch: `git push origin feature/amazing-feature`
10. Open a Pull Request

### Guidelines

- Maintain existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Keep commits atomic and well-described

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern query languages and parsing techniques
- Built with TypeScript for type safety and developer experience
- Comprehensive testing ensures reliability and maintainability

## 📧 Support

- 🐛 [Report bugs](https://github.com/talkohavy/create-query-language/issues)
- 💡 [Request features](https://github.com/talkohavy/create-query-language/issues)
- 📖 [Documentation](https://github.com/talkohavy/create-query-language#readme)
- 📧 [Email support](mailto:talkohavy@gmail.com)

---

Made with ❤️ by [Tal Kohavy](https://github.com/talkohavy)

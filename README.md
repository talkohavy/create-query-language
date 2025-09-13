# Create Query Language

<p align="center">
  <img src="https://i.ibb.co/8LLRHz6c/create-query-language.png" width="250" alt="create-query-language logo" />
</p>

A flexible TypeScript library for parsing and building query languages with support for lexical analysis, AST generation, and token stream processing.

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

type ParseResult {
  success: boolean;
  ast?: QueryExpression;
  errors: ParseError[];
  tokens: Token[];
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

## 📊 Coverage

Current test coverage: **90%+**

- ✅ Statements: 90.38%
- ✅ Branches: 79.57%
- ✅ Functions: 98.33%
- ✅ Lines: 90.98%

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

- 🐛 [Report bugs](https://github.com/talkohavy/create-query-language/issues)
- 💡 [Request features](https://github.com/talkohavy/create-query-language/issues)
- 📖 [Documentation](https://github.com/talkohavy/create-query-language#readme)
- 📧 [Email support](mailto:talkohavy@gmail.com)

---

Made with ❤️ by [Tal Kohavy](https://github.com/talkohavy)

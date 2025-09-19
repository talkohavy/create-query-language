import type { Token, QueryLexerOptions } from './types';
import { type BooleanOperatorValues, BooleanOperators } from '../common/constants';
import { ComparatorBeginnings, SpecialChars, TokenTypes, type TokenTypeValues } from './logic/constants';

export class QueryLexer {
  private input = '';
  private position = 0;
  private line = 1;
  private column = 1;
  private options: QueryLexerOptions;

  constructor(options: Partial<QueryLexerOptions> = {}) {
    this.options = options;
  }

  tokenize(input: string): Token[] {
    this.reset();
    this.input = input;

    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      const token = this.nextToken();
      if (token) {
        tokens.push(token);
      }
    }

    tokens.push(this.createToken(TokenTypes.EOF, '', this.position, this.position));

    return tokens;
  }

  /**
   * Reset lexer to beginning of input
   */
  private reset(): void {
    this.position = 0;
    this.line = 1;
    this.column = 1;
  }

  /**
   * Check if we've reached the end of input
   */
  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }

  private nextToken(): Token | null {
    if (this.isAtEnd()) return null;

    const start = this.position;
    const char = this.currentChar();

    // Handle whitespace
    if (this.getIsWhitespace(char)) {
      const whitespacesToken = this.scanWhitespace(start);
      return whitespacesToken;
    }

    // Handle comparison operators (multi-character first)
    if (ComparatorBeginnings.includes(char)) {
      const comparatorToken = this.scanComparator(start);
      return comparatorToken;
    }

    // Handle a valid COLON char (that comes after a Key)
    if (char === SpecialChars.Colon) {
      this.advance();

      const colonToken = this.createToken(TokenTypes.Colon, char, start, this.position);

      return colonToken;
    }

    // Handle quoted strings
    if (char === SpecialChars.SingleQuote || char === SpecialChars.DoubleQuote) {
      const quotedStringToken = this.scanQuotedString(start);
      return quotedStringToken;
    }

    // Handle Parentheses
    if (char === SpecialChars.LeftParenthesis) {
      this.advance();

      const leftParenthesisToken = this.createToken(TokenTypes.LeftParenthesis, char, start, this.position);

      return leftParenthesisToken;
    }

    // Handle Right Parenthesis
    if (char === SpecialChars.RightParenthesis) {
      this.advance();

      const rightParenthesisToken = this.createToken(TokenTypes.RightParenthesis, char, start, this.position);

      return rightParenthesisToken;
    }

    // Handle Word
    if (this.isIdentifierStart(char)) {
      const keyToken = this.scanWord(start);
      return keyToken;
    }

    // Unknown character - create invalid token
    this.advance();
    const invalidToken = this.createToken(TokenTypes.Invalid, char, start, this.position);
    return invalidToken;
  }

  private currentChar(): string {
    return this.input[this.position] || '';
  }

  private createToken(type: TokenTypeValues, value: string, start: number, end: number): Token {
    return {
      type,
      value,
      position: {
        start,
        end,
        line: this.line,
        column: this.column - (end - start),
      },
    };
  }

  private scanWhitespace(start: number): Token {
    while (!this.isAtEnd() && this.getIsWhitespace(this.currentChar())) {
      this.advance();
    }

    const allWhitespacesValue = this.input.slice(start, this.position);
    const allWhitespacesToken = this.createToken(TokenTypes.Whitespace, allWhitespacesValue, start, this.position);

    return allWhitespacesToken;
  }

  /**
   * Scan quoted string (single or double quotes)
   */
  private scanQuotedString(startPosition: number): Token {
    const openingQuote = this.currentChar();
    this.advance(); // <--- Skip the opening quote

    let valueWithinQuotes = '';
    let escaped = false;

    while (!this.isAtEnd()) {
      const nextChar = this.currentChar();

      if (escaped) {
        // Handle escape sequences
        switch (nextChar) {
          case 'n':
            valueWithinQuotes += '\n';
            break;
          case 't':
            valueWithinQuotes += '\t';
            break;
          case 'r':
            valueWithinQuotes += '\r';
            break;
          case '\\':
            valueWithinQuotes += '\\';
            break;
          case '"':
            valueWithinQuotes += '"';
            break;
          case "'":
            valueWithinQuotes += "'";
            break;
          default:
            valueWithinQuotes += nextChar;
        }
        escaped = false;
      } else if (nextChar === '\\') {
        escaped = true;
      } else if (nextChar === openingQuote) {
        this.advance(); // <--- Skip closing quote
        const quotedStringToken = this.createToken(
          TokenTypes.QuotedString,
          valueWithinQuotes,
          startPosition,
          this.position,
        );
        return quotedStringToken;
      } else {
        valueWithinQuotes += nextChar;
      }

      this.advance();
    }

    // string was opened, but never closed! return invalid token
    const invalidQuotedStringValue = this.input.slice(startPosition, this.position);
    const invalidToken = this.createToken(TokenTypes.Invalid, invalidQuotedStringValue, startPosition, this.position);

    return invalidToken;
  }

  /**
   * Scan comparison operators (<=, >=, !=, <, >)
   */
  private scanComparator(startPosition: number): Token {
    const char = this.currentChar();
    this.advance();

    // Check for two-character operators (i.e. <=, >=, !=, ==)
    const nextChar = this.currentChar();
    if (nextChar === '=') {
      this.advance();
      const comparatorValue = `${char}${nextChar}`;
      const comparatorToken = this.createToken(TokenTypes.Comparator, comparatorValue, startPosition, this.position);
      return comparatorToken;
    }

    // Assume valid single-character operator ('<' or '>')
    let tokenType: TokenTypeValues = TokenTypes.Comparator;

    // Check for Invalid combination (for example '!' without '=' , or '=' alone)
    if (char === '!' || char === '=') {
      tokenType = TokenTypes.Invalid;
    }

    const comparatorToken = this.createToken(tokenType, char, startPosition, this.position);

    return comparatorToken;
  }

  /**
   * Scan word (could be one of: key / value / AND / OR
   */
  private scanWord(startPosition: number): Token {
    while (!this.isAtEnd() && this.isPartOfIdentifier(this.currentChar())) {
      this.advance();
    }

    const wordValue = this.input.slice(startPosition, this.position);
    const uppercaseValue = (
      this.options.caseSensitiveOperators ? wordValue : wordValue.toUpperCase()
    ) as BooleanOperatorValues;

    if (BooleanOperators[uppercaseValue]) {
      const logicalOperatorToken = this.scanLogicalOperator(startPosition, uppercaseValue, wordValue);
      return logicalOperatorToken;
    }

    const wordToken = this.createToken(TokenTypes.Identifier, wordValue, startPosition, this.position);

    return wordToken;
  }

  private scanLogicalOperator(startPosition: number, uppercaseValue: string, tokenValue: string): Token {
    let logicalOperatorTokenType: TokenTypeValues;

    if (uppercaseValue === TokenTypes.AND) {
      logicalOperatorTokenType = TokenTypes.AND;
    } else if (uppercaseValue === TokenTypes.OR) {
      logicalOperatorTokenType = TokenTypes.OR;
    } else if (uppercaseValue === TokenTypes.NOT) {
      logicalOperatorTokenType = TokenTypes.NOT;
    } else {
      // This shouldn't happen, but fallback to Identifier
      logicalOperatorTokenType = TokenTypes.Identifier;
    }

    const logicalOperatorToken = this.createToken(logicalOperatorTokenType, tokenValue, startPosition, this.position);

    return logicalOperatorToken;
  }

  /**
   * Advance position and update line/column tracking
   */
  private advance(): void {
    if (this.position < this.input.length) {
      const char = this.input[this.position];
      this.position++;

      if (char === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
    }
  }

  /**
   * Check if character is whitespace
   */
  private getIsWhitespace(char: string): boolean {
    return /^\s+$/.test(char);
  }

  /**
   * Check if character can start an identifier
   */
  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  /**
   * Check if character can be part of an identifier (key / value)
   */
  private isPartOfIdentifier(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  static getTokenAtPosition(tokens: Token[], position: number): Token | null {
    for (const token of tokens) {
      if (position > token.position.start && position <= token.position.end) {
        return token;
      }
    }

    return null;
  }
}

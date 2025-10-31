import type { Token } from '../QueryLexer';
import { ASTUtils } from '../ASTUtils';
import { TokenTypes } from '../QueryLexer';
import { TokenStream } from './TokenStream';

describe('TokenStream', () => {
  // Helper function to create tokens for testing
  function createToken(type: keyof typeof TokenTypes, value: string, start: number, end: number): Token {
    return {
      type: TokenTypes[type],
      value,
      position: ASTUtils.createPosition(start, end),
      next: null,
      prev: null,
    };
  }

  function createTestTokens(): Token[] {
    return [
      createToken('Identifier', 'status', 0, 6),
      createToken('Whitespace', ' ', 6, 7),
      createToken('Colon', ':', 7, 8),
      createToken('Whitespace', ' ', 8, 9),
      createToken('Identifier', 'active', 9, 15),
      createToken('EndOfLine', '', 15, 15),
    ];
  }

  describe('constructor', () => {
    test('should initialize with tokens array', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      expect(tokenStream.current()).toBe(tokens[0]);
    });

    test('should initialize with empty tokens array', () => {
      const tokenStream = new TokenStream([]);

      expect(tokenStream.current()).toBeNull();
    });
  });

  describe('current', () => {
    test('should return the current token without advancing', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      const token = tokenStream.current();
      expect(token).toBe(tokens[0]);
      expect(token?.type).toBe('IDENTIFIER');
      expect(token?.value).toBe('status');

      // Should not advance position
      expect(tokenStream.current()).toBe(tokens[0]);
    });

    test('should return null when at end of tokens', () => {
      const tokenStream = new TokenStream([]);

      expect(tokenStream.current()).toBeNull();
    });
  });

  describe('consume', () => {
    test('should return current token and advance position', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      const firstToken = tokenStream.consume();
      expect(firstToken).toBe(tokens[0]);

      const secondToken = tokenStream.current();
      expect(secondToken).toBe(tokens[1]);
    });

    test('should return null and not advance when at end', () => {
      const tokenStream = new TokenStream([]);

      const token = tokenStream.consume();
      expect(token).toBeNull();
    });
  });

  describe('expect', () => {
    test('should return token if type matches', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      const token = tokenStream.tryGetCurrent('IDENTIFIER');
      expect(token.type).toBe('IDENTIFIER');
      expect(token.value).toBe('status');

      // Should advance position
      expect(tokenStream.current()?.type).toBe('WHITESPACE');
    });

    test('should throw error if type does not match', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      expect(() => {
        tokenStream.tryGetCurrent('COLON');
      }).toThrow('Expected COLON but got IDENTIFIER at position 0');
    });

    test('should throw error when at end of input', () => {
      const tokenStream = new TokenStream([]);

      expect(() => {
        tokenStream.tryGetCurrent('IDENTIFIER');
      }).toThrow('Expected IDENTIFIER but reached end of input');
    });
  });

  describe('isCurrentAMatchWith', () => {
    test('should return true when current token matches expected type', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      expect(tokenStream.isCurrentAMatchWith('IDENTIFIER')).toBe(true);
      expect(tokenStream.isCurrentAMatchWith('COLON')).toBe(false);
    });

    test('should return false when no current token', () => {
      const tokenStream = new TokenStream([]);

      expect(tokenStream.isCurrentAMatchWith('IDENTIFIER')).toBe(false);
    });
  });

  describe('matchAny', () => {
    test('should return true when current token matches any expected type', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      expect(tokenStream.matchAny('IDENTIFIER', 'COLON')).toBe(true);
      expect(tokenStream.matchAny('COLON', 'AND')).toBe(false);
    });

    test('should return false when no current token', () => {
      const tokenStream = new TokenStream([]);

      expect(tokenStream.matchAny('IDENTIFIER', 'COLON')).toBe(false);
    });
  });

  describe('countAndSkipWhitespaces', () => {
    test('should count and skip whitespace tokens', () => {
      const tokens = [
        createToken('Identifier', 'test', 0, 4),
        createToken('Whitespace', '   ', 4, 7),
        createToken('Whitespace', '\t', 7, 8),
        createToken('Colon', ':', 8, 9),
      ];
      const tokenStream = new TokenStream(tokens);

      tokenStream.advance(); // Move to first whitespace

      const context = { expectedTokens: ['colon'] };
      const spaceCount = tokenStream.countAndSkipWhitespaces(context as any);

      expect(spaceCount).toBe(4); // 3 spaces + 1 tab
      expect(tokenStream.current()?.type).toBe('COLON');
    });

    test('should return 0 when no whitespace tokens', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      const context = { expectedTokens: ['key'] };
      const spaceCount = tokenStream.countAndSkipWhitespaces(context as any);

      expect(spaceCount).toBe(0);
      expect(tokenStream.current()?.type).toBe('IDENTIFIER');
    });
  });

  describe('advance', () => {
    test('should advance position by one', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      expect(tokenStream.current()).toBe(tokens[0]);

      tokenStream.advance();
      expect(tokenStream.current()).toBe(tokens[1]);

      tokenStream.advance();
      expect(tokenStream.current()).toBe(tokens[2]);
    });

    test('should not advance beyond tokens length', () => {
      const tokens = [createToken('Identifier', 'test', 0, 4)];
      const tokenStream = new TokenStream(tokens);

      tokenStream.advance();
      tokenStream.advance(); // Should not crash or go beyond

      expect(tokenStream.current()).toBeNull();
    });
  });

  describe('isAtEnd', () => {
    test('should return false when not at end', () => {
      const tokens = createTestTokens();
      const tokenStream = new TokenStream(tokens);

      expect(tokenStream.isAtEnd()).toBe(false);
    });

    test('should return true when no current token', () => {
      const tokenStream = new TokenStream([]);

      expect(tokenStream.isAtEnd()).toBe(true);
    });

    test('should return true when current token is END_OF_LINE', () => {
      const tokens = [createToken('EndOfLine', '', 0, 0)];
      const tokenStream = new TokenStream(tokens);

      expect(tokenStream.isAtEnd()).toBe(true);
    });
  });
});

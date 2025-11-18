import type { QueryExpression } from '../ASTUtils';
import type { Position } from '../logic/types';
import type { Token } from '../QueryLexer';
import type { ContextTypeValues } from './logic/constants';

export type ParseResult = {
  success: boolean;
  /**
   * AST means "Abstract Syntax Tree". Look it up on Wikipedia.
   */
  ast?: QueryExpression;
  errors: ParseError[];
  tokens: Token[];
};

export type ParseError = {
  message: string;
  position: Position;
};

export type QueryParserOptions = {
  maxErrors: number;
};

type TokenContextBase = {
  expectedTokens: ContextTypeValues[]; // <--- Context information for whitespace tokens (added during parsing)
};

export type TokenContextWithKey = TokenContextBase & {
  key: string;
};

export type TokenContext = TokenContextBase | TokenContextWithKey;

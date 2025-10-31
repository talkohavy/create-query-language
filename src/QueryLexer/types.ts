import type { Position } from '../logic/types';
import type { TokenContext } from '../QueryParser';
import type { TokenTypeValues } from './logic/constants';

export type Token = {
  type: TokenTypeValues;
  value: string;
  position: Position;
  context?: TokenContext;
  prev: Token | null;
  next: Token | null;
};

export type QueryLexerOptions = {
  caseSensitiveOperators?: boolean;
};

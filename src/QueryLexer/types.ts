import type { Position } from '../common/types';
import type { TokenContext } from '../QueryParser';
import type { TokenTypeValues } from './logic/constants';

export type Token = {
  type: TokenTypeValues;
  value: string;
  position: Position;
  context?: TokenContext;
};

export type QueryLexerOptions = {
  caseSensitiveOperators?: boolean;
};

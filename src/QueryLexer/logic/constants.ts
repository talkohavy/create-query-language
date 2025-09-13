export const TokenTypes = {
  Whitespace: 'WHITESPACE',
  LeftParenthesis: 'LEFT_PARENTHESIS',
  RightParenthesis: 'RIGHT_PARENTHESIS',
  AND: 'AND',
  OR: 'OR',
  Comparator: 'COMPARATOR',
  Colon: 'COLON',
  QuotedString: 'QUOTED_STRING',
  Identifier: 'IDENTIFIER', // <--- Either key or value that is pure alphanumeric (with underscores and hyphens)
  Invalid: 'INVALID',
  EOF: 'EOF',
} as const;

type TokenTypesType = typeof TokenTypes;
export type TokenTypeKeys = keyof TokenTypesType;
export type TokenTypeValues = TokenTypesType[TokenTypeKeys];

export const ComparatorBeginnings = ['>', '<', '=', '!'];

export const SpecialChars = {
  Colon: ':',
  LeftParenthesis: '(',
  RightParenthesis: ')',
  SingleQuote: "'",
  DoubleQuote: '"',
} as const;

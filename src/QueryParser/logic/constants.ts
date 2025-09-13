export const ContextTypes = {
  Key: 'key',
  Value: 'value',
  QuotedString: 'quoted-string',
  LogicalOperator: 'operator',
  Comparator: 'comparator',
  Colon: 'colon',
  LeftParenthesis: 'left-parenthesis',
  RightParenthesis: 'right-parenthesis',
} as const;

type TypeOfContextType = typeof ContextTypes;
export type ContextTypeKeys = keyof TypeOfContextType;
export type ContextTypeValues = TypeOfContextType[ContextTypeKeys];

export const ERROR_MESSAGES = {
  EXPECTED_KEY: 'Expected key name',
  EXPECTED_COMPARATOR: 'Expected comparator (i.e. :,<,>,=) after key',
  EXPECTED_VALUE: 'Expected value after comparator',
  EXPECTED_EXPRESSION_AFTER_AND: "Expected expression after 'AND'",
  EXPECTED_EXPRESSION_IN_PARENTHESES: 'Expected expression inside parentheses',
  EXPECTED_OPERATOR: "Expected 'AND' or 'OR'",
  EXPECTED_CLOSING_PARENTHESES: 'Expected closing parenthesis',
  EMPTY_QUERY: 'Empty query',
  EMPTY_PARENTHESES: 'Empty parentheses not allowed',
} as const;

export const ERROR_CODES = {
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  UNEXPECTED_TOKEN: 'UNEXPECTED_TOKEN',
  MISSING_TOKEN: 'MISSING_TOKEN',
  UNBALANCED_PARENTHESES: 'UNBALANCED_PARENS',
  EMPTY_EXPRESSION: 'EMPTY_EXPRESSION',
} as const;

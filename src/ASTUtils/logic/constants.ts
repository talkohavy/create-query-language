export const AstTypes = {
  Key: 'key',
  Value: 'value',
  Comparator: 'comparator',
  LogicalOperator: 'logical-operator',
  Condition: 'condition',
  Group: 'group',
  Boolean: 'boolean',
  Not: 'not',
  Query: 'query',
  Error: 'error',
} as const;

type TypeOfAstTypes = typeof AstTypes;
export type AstTypeKeys = keyof TypeOfAstTypes;
export type AstTypeValues = TypeOfAstTypes[AstTypeKeys];

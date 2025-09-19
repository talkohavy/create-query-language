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
} as const;

type TypOfAstTypes = typeof AstTypes;
export type AstTypeKeys = keyof TypOfAstTypes;
export type AstTypeValues = TypOfAstTypes[AstTypeKeys];

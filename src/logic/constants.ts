export const LogicalOperators = {
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
} as const;

type TypeofLogicalOperator = typeof LogicalOperators;
type LogicalOperatorKeys = keyof TypeofLogicalOperator;
export type LogicalOperatorValues = TypeofLogicalOperator[LogicalOperatorKeys];

export const Comparators = {
  '>': '>',
  '<': '<',
  '>=': '>=',
  '<=': '<=',
  '!=': '!=',
  '==': '==',
} as const;

type TypeOfComparator = typeof Comparators;
type ComparatorKeys = keyof TypeOfComparator;
export type ComparatorValues = TypeOfComparator[ComparatorKeys];

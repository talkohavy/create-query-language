import type { LogicalOperatorValues, ComparatorValues } from '../logic/constants';
import type { Position } from '../logic/types';
import type {
  ASTNode,
  BooleanExpression,
  ComparatorNode,
  ConditionExpression,
  ErrorExpression,
  Expression,
  GroupExpression,
  KeyNode,
  LogicalOperatorNode,
  NotExpression,
  QueryExpression,
  ValueNode,
} from './types';
import { AstTypes } from './logic/constants';

export class ASTUtils {
  static createQuery(expression: Expression, position: Position): QueryExpression {
    return {
      type: AstTypes.Query,
      expression,
      position,
    };
  }

  static createBooleanExpression(
    operator: LogicalOperatorNode,
    left: Expression,
    right: Expression,
    position: Position,
  ): BooleanExpression {
    return {
      type: AstTypes.Boolean,
      operator,
      left,
      right,
      position,
    };
  }

  static createKey(value: string, position: Position): KeyNode {
    return {
      type: AstTypes.Key,
      value,
      position,
    };
  }

  static createComparator(value: ComparatorValues, position: Position): ComparatorNode {
    return {
      type: AstTypes.Comparator,
      value,
      position,
    };
  }

  static createOperator(value: LogicalOperatorValues, position: Position): LogicalOperatorNode {
    return {
      type: AstTypes.LogicalOperator,
      value,
      position,
    };
  }

  static createValue(value: string, position: Position): ValueNode {
    return {
      type: AstTypes.Value,
      value,
      position,
    };
  }

  static createCondition(
    key: KeyNode,
    comparator: ComparatorNode,
    value: ValueNode,
    spacesAfterKey: number,
    spacesAfterComparator: number,
    spacesAfterValue: number,
    position: Position,
  ): ConditionExpression {
    return {
      type: AstTypes.Condition,
      key,
      comparator,
      value,
      spacesAfterKey,
      spacesAfterComparator,
      spacesAfterValue,
      position,
    };
  }

  static createGroup(expression: Expression, position: Position): GroupExpression {
    return {
      type: AstTypes.Group,
      expression,
      position,
    };
  }

  static createNotExpression(expression: Expression, position: Position): NotExpression {
    return {
      type: AstTypes.Not,
      expression,
      position,
    };
  }

  static createErrorExpression(
    message: string,
    position: Position,
    partial?: {
      key?: KeyNode;
      comparator?: ComparatorNode;
      value?: ValueNode;
    },
  ): ErrorExpression {
    return { type: AstTypes.Error, message, position, partial };
  }

  static createPosition(start: number, end: number): Position {
    return { start, end };
  }

  /**
   * Merge multiple positions into a single position that spans all of them
   */
  static mergePositions(...positions: Position[]): Position {
    if (positions.length === 0) {
      return { start: 0, end: 0 };
    }

    const start = Math.min(...positions.map((p) => p.start));
    const end = Math.max(...positions.map((p) => p.end));

    return { start, end };
  }

  /**
   * Traverse the AST and apply a callback to each node
   */
  static traverseAST(
    node: Expression,
    parentNode: Expression | null,
    callback: (node: ASTNode, parentNode: ASTNode | null) => boolean,
  ): void {
    const shouldContinueDrillDown = callback(node, parentNode);

    if (!shouldContinueDrillDown) return;

    function traverse(current: Expression): void {
      switch (current.type) {
        case AstTypes.Query:
          traverse((current as QueryExpression).expression);
          break;

        case AstTypes.Condition: {
          const conditionNode = current as ConditionExpression;
          callback(conditionNode, parentNode);
          break;
        }

        case AstTypes.Group:
          traverse((current as GroupExpression).expression);
          break;

        case AstTypes.Not:
          traverse((current as NotExpression).expression);
          break;

        case AstTypes.Boolean: {
          const boolNode = current as BooleanExpression;
          traverse(boolNode.left);
          traverse(boolNode.right);
          break;
        }

        case AstTypes.Error: {
          const errorNode = current as ErrorExpression;
          callback(errorNode, parentNode);
          break;
        }
      }
    }

    traverse(node);
  }
}

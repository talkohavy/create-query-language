import { ASTBuilder } from './ASTBuilder';
import { AstTypes } from './logic/constants';

describe('ASTBuilder', () => {
  describe('createQuery', () => {
    test('should create a query node with correct structure', () => {
      const position = ASTBuilder.createPosition(0, 10);
      const key = ASTBuilder.createKey('status', position);
      const comparator = ASTBuilder.createComparator(':', position);
      const value = ASTBuilder.createValue('active', position);
      const condition = ASTBuilder.createCondition(key, comparator, value, 0, 1, 0, position);

      const query = ASTBuilder.createQuery(condition, position);

      expect(query.type).toBe(AstTypes.Query);
      expect(query.expression).toBe(condition);
      expect(query.position).toBe(position);
    });
  });

  describe('createBooleanExpression', () => {
    test('should create a boolean expression node', () => {
      const position = ASTBuilder.createPosition(0, 20);
      const operator = ASTBuilder.createOperator('AND', position);

      const leftKey = ASTBuilder.createKey('status', position);
      const leftComparator = ASTBuilder.createComparator(':', position);
      const leftValue = ASTBuilder.createValue('active', position);
      const leftCondition = ASTBuilder.createCondition(leftKey, leftComparator, leftValue, 0, 1, 0, position);

      const rightKey = ASTBuilder.createKey('role', position);
      const rightComparator = ASTBuilder.createComparator(':', position);
      const rightValue = ASTBuilder.createValue('admin', position);
      const rightCondition = ASTBuilder.createCondition(rightKey, rightComparator, rightValue, 0, 1, 0, position);

      const booleanExpr = ASTBuilder.createBooleanExpression(operator, leftCondition, rightCondition, position);

      expect(booleanExpr.type).toBe(AstTypes.Boolean);
      expect(booleanExpr.operator).toBe(operator);
      expect(booleanExpr.left).toBe(leftCondition);
      expect(booleanExpr.right).toBe(rightCondition);
      expect(booleanExpr.position).toBe(position);
    });
  });

  describe('createKey', () => {
    test('should create a key node', () => {
      const position = ASTBuilder.createPosition(0, 6);
      const key = ASTBuilder.createKey('status', position);

      expect(key.type).toBe(AstTypes.Key);
      expect(key.value).toBe('status');
      expect(key.position).toBe(position);
    });
  });

  describe('createComparator', () => {
    test('should create a comparator node with colon', () => {
      const position = ASTBuilder.createPosition(6, 7);
      const comparator = ASTBuilder.createComparator(':', position);

      expect(comparator.type).toBe(AstTypes.Comparator);
      expect(comparator.value).toBe(':');
      expect(comparator.position).toBe(position);
    });

    test('should create a comparator node with equals', () => {
      const position = ASTBuilder.createPosition(6, 8);
      const comparator = ASTBuilder.createComparator('==', position);

      expect(comparator.type).toBe(AstTypes.Comparator);
      expect(comparator.value).toBe('==');
      expect(comparator.position).toBe(position);
    });

    test('should create comparator nodes for all supported operators', () => {
      const operators = [':', '==', '!=', '<', '>', '<=', '>='] as const;

      operators.forEach((op) => {
        const position = ASTBuilder.createPosition(0, op.length);
        const comparator = ASTBuilder.createComparator(op, position);

        expect(comparator.type).toBe(AstTypes.Comparator);
        expect(comparator.value).toBe(op);
      });
    });
  });

  describe('createOperator', () => {
    test('should create an AND operator node', () => {
      const position = ASTBuilder.createPosition(10, 13);
      const operator = ASTBuilder.createOperator('AND', position);

      expect(operator.type).toBe(AstTypes.LogicalOperator);
      expect(operator.value).toBe('AND');
      expect(operator.position).toBe(position);
    });

    test('should create an OR operator node', () => {
      const position = ASTBuilder.createPosition(10, 12);
      const operator = ASTBuilder.createOperator('OR', position);

      expect(operator.type).toBe(AstTypes.LogicalOperator);
      expect(operator.value).toBe('OR');
      expect(operator.position).toBe(position);
    });
  });

  describe('createValue', () => {
    test('should create a value node', () => {
      const position = ASTBuilder.createPosition(8, 14);
      const value = ASTBuilder.createValue('active', position);

      expect(value.type).toBe(AstTypes.Value);
      expect(value.value).toBe('active');
      expect(value.position).toBe(position);
    });

    test('should create a value node with quoted string', () => {
      const position = ASTBuilder.createPosition(8, 20);
      const value = ASTBuilder.createValue('John Doe', position);

      expect(value.type).toBe(AstTypes.Value);
      expect(value.value).toBe('John Doe');
      expect(value.position).toBe(position);
    });
  });

  describe('createCondition', () => {
    test('should create a condition node with all components', () => {
      const position = ASTBuilder.createPosition(0, 15);
      const key = ASTBuilder.createKey('status', ASTBuilder.createPosition(0, 6));
      const comparator = ASTBuilder.createComparator(':', ASTBuilder.createPosition(6, 7));
      const value = ASTBuilder.createValue('active', ASTBuilder.createPosition(8, 14));

      const condition = ASTBuilder.createCondition(key, comparator, value, 0, 1, 0, position);

      expect(condition.type).toBe(AstTypes.Condition);
      expect(condition.key).toBe(key);
      expect(condition.comparator).toBe(comparator);
      expect(condition.value).toBe(value);
      expect(condition.spacesAfterKey).toBe(0);
      expect(condition.spacesAfterComparator).toBe(1);
      expect(condition.spacesAfterValue).toBe(0);
      expect(condition.position).toBe(position);
    });

    test('should create a condition node with custom spacing', () => {
      const position = ASTBuilder.createPosition(0, 20);
      const key = ASTBuilder.createKey('name', ASTBuilder.createPosition(0, 4));
      const comparator = ASTBuilder.createComparator(':', ASTBuilder.createPosition(5, 6));
      const value = ASTBuilder.createValue('test', ASTBuilder.createPosition(9, 13));

      const condition = ASTBuilder.createCondition(key, comparator, value, 1, 2, 3, position);

      expect(condition.spacesAfterKey).toBe(1);
      expect(condition.spacesAfterComparator).toBe(2);
      expect(condition.spacesAfterValue).toBe(3);
    });
  });

  describe('createGroup', () => {
    test('should create a group node', () => {
      const position = ASTBuilder.createPosition(0, 17);
      const key = ASTBuilder.createKey('status', ASTBuilder.createPosition(1, 7));
      const comparator = ASTBuilder.createComparator(':', ASTBuilder.createPosition(7, 8));
      const value = ASTBuilder.createValue('active', ASTBuilder.createPosition(9, 15));
      const condition = ASTBuilder.createCondition(key, comparator, value, 0, 1, 0, ASTBuilder.createPosition(1, 15));

      const group = ASTBuilder.createGroup(condition, position);

      expect(group.type).toBe(AstTypes.Group);
      expect(group.expression).toBe(condition);
      expect(group.position).toBe(position);
    });
  });

  describe('createPosition', () => {
    test('should create a position with start and end', () => {
      const position = ASTBuilder.createPosition(5, 10);

      expect(position.start).toBe(5);
      expect(position.end).toBe(10);
      expect(position.line).toBeUndefined();
      expect(position.column).toBeUndefined();
    });

    test('should create a position with line and column', () => {
      const position = ASTBuilder.createPosition(5, 10, 2, 3);

      expect(position.start).toBe(5);
      expect(position.end).toBe(10);
      expect(position.line).toBe(2);
      expect(position.column).toBe(3);
    });
  });

  describe('mergePositions', () => {
    test('should merge two positions', () => {
      const pos1 = ASTBuilder.createPosition(5, 10, 1, 5);
      const pos2 = ASTBuilder.createPosition(15, 20, 1, 15);

      const merged = ASTBuilder.mergePositions(pos1, pos2);

      expect(merged.start).toBe(5);
      expect(merged.end).toBe(20);
      expect(merged.line).toBe(1);
      expect(merged.column).toBe(5);
    });

    test('should merge multiple positions', () => {
      const pos1 = ASTBuilder.createPosition(10, 15);
      const pos2 = ASTBuilder.createPosition(5, 8);
      const pos3 = ASTBuilder.createPosition(20, 25);

      const merged = ASTBuilder.mergePositions(pos1, pos2, pos3);

      expect(merged.start).toBe(5);
      expect(merged.end).toBe(25);
    });

    test('should handle empty array', () => {
      const merged = ASTBuilder.mergePositions();

      expect(merged.start).toBe(0);
      expect(merged.end).toBe(0);
    });

    test('should handle single position', () => {
      const pos = ASTBuilder.createPosition(10, 20, 2, 5);
      const merged = ASTBuilder.mergePositions(pos);

      expect(merged.start).toBe(10);
      expect(merged.end).toBe(20);
      expect(merged.line).toBe(2);
      expect(merged.column).toBe(5);
    });
  });

  describe('traverseAST', () => {
    test('should traverse a simple condition', () => {
      const key = ASTBuilder.createKey('status', ASTBuilder.createPosition(0, 6));
      const comparator = ASTBuilder.createComparator(':', ASTBuilder.createPosition(6, 7));
      const value = ASTBuilder.createValue('active', ASTBuilder.createPosition(8, 14));
      const condition = ASTBuilder.createCondition(key, comparator, value, 0, 1, 0, ASTBuilder.createPosition(0, 14));

      const visitedNodes: string[] = [];

      ASTBuilder.traverseAST(condition, null, (node) => {
        visitedNodes.push(node.type);
        return true;
      });

      expect(visitedNodes).toEqual(['condition', 'key', 'comparator', 'value']);
    });

    test('should traverse a group expression', () => {
      const key = ASTBuilder.createKey('status', ASTBuilder.createPosition(1, 7));
      const comparator = ASTBuilder.createComparator(':', ASTBuilder.createPosition(7, 8));
      const value = ASTBuilder.createValue('active', ASTBuilder.createPosition(9, 15));
      const condition = ASTBuilder.createCondition(key, comparator, value, 0, 1, 0, ASTBuilder.createPosition(1, 15));
      const group = ASTBuilder.createGroup(condition, ASTBuilder.createPosition(0, 16));

      const visitedNodes: string[] = [];

      ASTBuilder.traverseAST(group, null, (node) => {
        visitedNodes.push(node.type);
        return true;
      });

      expect(visitedNodes).toEqual(['group', 'key', 'comparator', 'value']);
    });

    test('should traverse a boolean expression', () => {
      const leftKey = ASTBuilder.createKey('status', ASTBuilder.createPosition(0, 6));
      const leftComparator = ASTBuilder.createComparator(':', ASTBuilder.createPosition(6, 7));
      const leftValue = ASTBuilder.createValue('active', ASTBuilder.createPosition(8, 14));
      const leftCondition = ASTBuilder.createCondition(
        leftKey,
        leftComparator,
        leftValue,
        0,
        1,
        0,
        ASTBuilder.createPosition(0, 14),
      );

      const rightKey = ASTBuilder.createKey('role', ASTBuilder.createPosition(19, 23));
      const rightComparator = ASTBuilder.createComparator(':', ASTBuilder.createPosition(23, 24));
      const rightValue = ASTBuilder.createValue('admin', ASTBuilder.createPosition(25, 30));
      const rightCondition = ASTBuilder.createCondition(
        rightKey,
        rightComparator,
        rightValue,
        0,
        1,
        0,
        ASTBuilder.createPosition(19, 30),
      );

      const operator = ASTBuilder.createOperator('AND', ASTBuilder.createPosition(15, 18));
      const booleanExpr = ASTBuilder.createBooleanExpression(
        operator,
        leftCondition,
        rightCondition,
        ASTBuilder.createPosition(0, 30),
      );

      const visitedNodes: string[] = [];

      ASTBuilder.traverseAST(booleanExpr, null, (node) => {
        visitedNodes.push(node.type);
        return true;
      });

      expect(visitedNodes).toEqual([
        'boolean',
        'key',
        'comparator',
        'value',
        'key',
        'comparator',
        'value',
      ]);
    });

    test('should stop traversal when callback returns false', () => {
      const key = ASTBuilder.createKey('status', ASTBuilder.createPosition(0, 6));
      const comparator = ASTBuilder.createComparator(':', ASTBuilder.createPosition(6, 7));
      const value = ASTBuilder.createValue('active', ASTBuilder.createPosition(8, 14));
      const condition = ASTBuilder.createCondition(key, comparator, value, 0, 1, 0, ASTBuilder.createPosition(0, 14));

      const visitedNodes: string[] = [];

      ASTBuilder.traverseAST(condition, null, (node) => {
        visitedNodes.push(node.type);
        return false; // Stop traversal
      });

      expect(visitedNodes).toEqual(['condition']);
    });

    test('should provide parent node information', () => {
      const key = ASTBuilder.createKey('status', ASTBuilder.createPosition(0, 6));
      const comparator = ASTBuilder.createComparator(':', ASTBuilder.createPosition(6, 7));
      const value = ASTBuilder.createValue('active', ASTBuilder.createPosition(8, 14));
      const condition = ASTBuilder.createCondition(key, comparator, value, 0, 1, 0, ASTBuilder.createPosition(0, 14));

      const parentNodes: Array<string | null> = [];

      ASTBuilder.traverseAST(condition, null, (_node, parent) => {
        parentNodes.push(parent?.type || null);
        return true;
      });

      expect(parentNodes).toEqual([null, 'condition', 'condition', 'condition']);
    });
  });
});

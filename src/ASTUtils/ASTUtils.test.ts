import { ASTUtils } from './ASTUtils';
import { AstTypes } from './logic/constants';

describe('ASTUtils', () => {
  describe('createQuery', () => {
    test('should create a query node with correct structure', () => {
      const position = ASTUtils.createPosition(0, 10);
      const key = ASTUtils.createKey('status', position);
      const comparator = ASTUtils.createComparator('<', position);
      const value = ASTUtils.createValue('active', position);
      const condition = ASTUtils.createCondition(key, comparator, value, 0, 1, 0, position);

      const query = ASTUtils.createQuery(condition, position);

      expect(query.type).toBe(AstTypes.Query);
      expect(query.expression).toBe(condition);
      expect(query.position).toBe(position);
    });
  });

  describe('createBooleanExpression', () => {
    test('should create a boolean expression node', () => {
      const position = ASTUtils.createPosition(0, 20);
      const operator = ASTUtils.createOperator('AND', position);

      const leftKey = ASTUtils.createKey('status', position);
      const leftComparator = ASTUtils.createComparator('<', position);
      const leftValue = ASTUtils.createValue('active', position);
      const leftCondition = ASTUtils.createCondition(leftKey, leftComparator, leftValue, 0, 1, 0, position);

      const rightKey = ASTUtils.createKey('role', position);
      const rightComparator = ASTUtils.createComparator('<', position);
      const rightValue = ASTUtils.createValue('admin', position);
      const rightCondition = ASTUtils.createCondition(rightKey, rightComparator, rightValue, 0, 1, 0, position);

      const booleanExpr = ASTUtils.createBooleanExpression(operator, leftCondition, rightCondition, position);

      expect(booleanExpr.type).toBe(AstTypes.Boolean);
      expect(booleanExpr.operator).toBe(operator);
      expect(booleanExpr.left).toBe(leftCondition);
      expect(booleanExpr.right).toBe(rightCondition);
      expect(booleanExpr.position).toBe(position);
    });
  });

  describe('createKey', () => {
    test('should create a key node', () => {
      const position = ASTUtils.createPosition(0, 6);
      const key = ASTUtils.createKey('status', position);

      expect(key.type).toBe(AstTypes.Key);
      expect(key.value).toBe('status');
      expect(key.position).toBe(position);
    });
  });

  describe('createComparator', () => {
    test('should create a comparator node with colon', () => {
      const position = ASTUtils.createPosition(6, 7);
      const comparator = ASTUtils.createComparator('<', position);

      expect(comparator.type).toBe(AstTypes.Comparator);
      expect(comparator.value).toBe('<');
      expect(comparator.position).toBe(position);
    });

    test('should create comparator nodes for all supported operators', () => {
      const operators = ['<', '==', '!=', '<', '>', '<=', '>='] as const;

      operators.forEach((op) => {
        const position = ASTUtils.createPosition(0, op.length);
        const comparator = ASTUtils.createComparator(op, position);

        expect(comparator.type).toBe(AstTypes.Comparator);
        expect(comparator.value).toBe(op);
      });
    });
  });

  describe('createOperator', () => {
    test('should create an AND operator node', () => {
      const position = ASTUtils.createPosition(10, 13);
      const operator = ASTUtils.createOperator('AND', position);

      expect(operator.type).toBe(AstTypes.LogicalOperator);
      expect(operator.value).toBe('AND');
      expect(operator.position).toBe(position);
    });

    test('should create an OR operator node', () => {
      const position = ASTUtils.createPosition(10, 12);
      const operator = ASTUtils.createOperator('OR', position);

      expect(operator.type).toBe(AstTypes.LogicalOperator);
      expect(operator.value).toBe('OR');
      expect(operator.position).toBe(position);
    });
  });

  describe('createValue', () => {
    test('should create a value node', () => {
      const position = ASTUtils.createPosition(8, 14);
      const value = ASTUtils.createValue('active', position);

      expect(value.type).toBe(AstTypes.Value);
      expect(value.value).toBe('active');
      expect(value.position).toBe(position);
    });

    test('should create a value node with quoted string', () => {
      const position = ASTUtils.createPosition(8, 20);
      const value = ASTUtils.createValue('John Doe', position);

      expect(value.type).toBe(AstTypes.Value);
      expect(value.value).toBe('John Doe');
      expect(value.position).toBe(position);
    });
  });

  describe('createCondition', () => {
    test('should create a condition node with all components', () => {
      const position = ASTUtils.createPosition(0, 15);
      const key = ASTUtils.createKey('status', ASTUtils.createPosition(0, 6));
      const comparator = ASTUtils.createComparator('<', ASTUtils.createPosition(6, 7));
      const value = ASTUtils.createValue('active', ASTUtils.createPosition(8, 14));

      const condition = ASTUtils.createCondition(key, comparator, value, 0, 1, 0, position);

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
      const position = ASTUtils.createPosition(0, 20);
      const key = ASTUtils.createKey('name', ASTUtils.createPosition(0, 4));
      const comparator = ASTUtils.createComparator('<', ASTUtils.createPosition(5, 6));
      const value = ASTUtils.createValue('test', ASTUtils.createPosition(9, 13));

      const condition = ASTUtils.createCondition(key, comparator, value, 1, 2, 3, position);

      expect(condition.spacesAfterKey).toBe(1);
      expect(condition.spacesAfterComparator).toBe(2);
      expect(condition.spacesAfterValue).toBe(3);
    });
  });

  describe('createGroup', () => {
    test('should create a group node', () => {
      const position = ASTUtils.createPosition(0, 17);
      const key = ASTUtils.createKey('status', ASTUtils.createPosition(1, 7));
      const comparator = ASTUtils.createComparator('<', ASTUtils.createPosition(7, 8));
      const value = ASTUtils.createValue('active', ASTUtils.createPosition(9, 15));
      const condition = ASTUtils.createCondition(key, comparator, value, 0, 1, 0, ASTUtils.createPosition(1, 15));

      const group = ASTUtils.createGroup(condition, position);

      expect(group.type).toBe(AstTypes.Group);
      expect(group.expression).toBe(condition);
      expect(group.position).toBe(position);
    });
  });

  describe('createPosition', () => {
    test('should create a position with start and end', () => {
      const position = ASTUtils.createPosition(5, 10);

      expect(position.start).toBe(5);
      expect(position.end).toBe(10);
    });
  });

  describe('mergePositions', () => {
    test('should merge multiple positions', () => {
      const pos1 = ASTUtils.createPosition(10, 15);
      const pos2 = ASTUtils.createPosition(5, 8);
      const pos3 = ASTUtils.createPosition(20, 25);

      const merged = ASTUtils.mergePositions(pos1, pos2, pos3);

      expect(merged.start).toBe(5);
      expect(merged.end).toBe(25);
    });

    test('should handle empty array', () => {
      const merged = ASTUtils.mergePositions();

      expect(merged.start).toBe(0);
      expect(merged.end).toBe(0);
    });
  });

  describe('traverseAST', () => {
    test('should traverse a simple condition', () => {
      const key = ASTUtils.createKey('status', ASTUtils.createPosition(0, 6));
      const comparator = ASTUtils.createComparator('<', ASTUtils.createPosition(6, 7));
      const value = ASTUtils.createValue('active', ASTUtils.createPosition(8, 14));
      const condition = ASTUtils.createCondition(key, comparator, value, 0, 1, 0, ASTUtils.createPosition(0, 14));

      const visitedNodes: string[] = [];

      ASTUtils.traverseAST(condition, null, (node) => {
        visitedNodes.push(node.type);
        return true;
      });

      // First callback on root node, then callback on condition during traversal
      expect(visitedNodes).toEqual(['condition', 'condition']);
    });

    test('should traverse a group expression', () => {
      const key = ASTUtils.createKey('status', ASTUtils.createPosition(1, 7));
      const comparator = ASTUtils.createComparator('<', ASTUtils.createPosition(7, 8));
      const value = ASTUtils.createValue('active', ASTUtils.createPosition(9, 15));
      const condition = ASTUtils.createCondition(key, comparator, value, 0, 1, 0, ASTUtils.createPosition(1, 15));
      const group = ASTUtils.createGroup(condition, ASTUtils.createPosition(0, 16));

      const visitedNodes: string[] = [];

      ASTUtils.traverseAST(group, null, (node) => {
        visitedNodes.push(node.type);
        return true;
      });

      expect(visitedNodes).toEqual(['group', 'condition']);
    });

    test('should traverse a boolean expression', () => {
      const leftKey = ASTUtils.createKey('status', ASTUtils.createPosition(0, 6));
      const leftComparator = ASTUtils.createComparator('<', ASTUtils.createPosition(6, 7));
      const leftValue = ASTUtils.createValue('active', ASTUtils.createPosition(8, 14));
      const leftCondition = ASTUtils.createCondition(
        leftKey,
        leftComparator,
        leftValue,
        0,
        1,
        0,
        ASTUtils.createPosition(0, 14),
      );

      const rightKey = ASTUtils.createKey('role', ASTUtils.createPosition(19, 23));
      const rightComparator = ASTUtils.createComparator('<', ASTUtils.createPosition(23, 24));
      const rightValue = ASTUtils.createValue('admin', ASTUtils.createPosition(25, 30));
      const rightCondition = ASTUtils.createCondition(
        rightKey,
        rightComparator,
        rightValue,
        0,
        1,
        0,
        ASTUtils.createPosition(19, 30),
      );

      const operator = ASTUtils.createOperator('AND', ASTUtils.createPosition(15, 18));
      const booleanExpr = ASTUtils.createBooleanExpression(
        operator,
        leftCondition,
        rightCondition,
        ASTUtils.createPosition(0, 30),
      );

      const visitedNodes: string[] = [];

      ASTUtils.traverseAST(booleanExpr, null, (node) => {
        visitedNodes.push(node.type);
        return true;
      });

      expect(visitedNodes).toEqual(['boolean', 'condition', 'condition']);
    });

    test('should stop traversal when callback returns false', () => {
      const key = ASTUtils.createKey('status', ASTUtils.createPosition(0, 6));
      const comparator = ASTUtils.createComparator('<', ASTUtils.createPosition(6, 7));
      const value = ASTUtils.createValue('active', ASTUtils.createPosition(8, 14));
      const condition = ASTUtils.createCondition(key, comparator, value, 0, 1, 0, ASTUtils.createPosition(0, 14));

      const visitedNodes: string[] = [];

      ASTUtils.traverseAST(condition, null, (node) => {
        visitedNodes.push(node.type);
        return false; // Stop traversal
      });

      expect(visitedNodes).toEqual(['condition']);
    });

    test('should provide parent node information', () => {
      const key = ASTUtils.createKey('status', ASTUtils.createPosition(0, 6));
      const comparator = ASTUtils.createComparator('<', ASTUtils.createPosition(6, 7));
      const value = ASTUtils.createValue('active', ASTUtils.createPosition(8, 14));
      const condition = ASTUtils.createCondition(key, comparator, value, 0, 1, 0, ASTUtils.createPosition(0, 14));

      const parentNodes: Array<string | null> = [];

      ASTUtils.traverseAST(condition, null, (_node, parent) => {
        parentNodes.push(parent?.type || null);
        return true;
      });

      expect(parentNodes).toEqual([null, null]);
    });

    test('should traverse nested groups', () => {
      const key = ASTUtils.createKey('status', ASTUtils.createPosition(2, 8));
      const comparator = ASTUtils.createComparator('<', ASTUtils.createPosition(8, 9));
      const value = ASTUtils.createValue('active', ASTUtils.createPosition(10, 16));
      const condition = ASTUtils.createCondition(key, comparator, value, 0, 1, 0, ASTUtils.createPosition(2, 16));
      const innerGroup = ASTUtils.createGroup(condition, ASTUtils.createPosition(1, 17));
      const outerGroup = ASTUtils.createGroup(innerGroup, ASTUtils.createPosition(0, 18));

      const visitedNodes: string[] = [];

      ASTUtils.traverseAST(outerGroup, null, (node) => {
        visitedNodes.push(node.type);
        return true;
      });

      // Callback on outer group, then traverses through inner group to condition
      expect(visitedNodes).toEqual(['group', 'condition']);
    });

    test('should traverse NOT expression', () => {
      const key = ASTUtils.createKey('status', ASTUtils.createPosition(5, 11));
      const comparator = ASTUtils.createComparator('<', ASTUtils.createPosition(11, 12));
      const value = ASTUtils.createValue('active', ASTUtils.createPosition(13, 19));
      const condition = ASTUtils.createCondition(key, comparator, value, 0, 1, 0, ASTUtils.createPosition(5, 19));
      const notExpr = ASTUtils.createNotExpression(condition, ASTUtils.createPosition(0, 19));

      const visitedNodes: string[] = [];

      ASTUtils.traverseAST(notExpr, null, (node) => {
        visitedNodes.push(node.type);
        return true;
      });

      // Callback on NOT, then on the inner condition
      expect(visitedNodes).toEqual(['not', 'condition']);
    });

    test('should traverse complex nested boolean expressions', () => {
      // (status:active AND role:admin) OR name:test
      const leftKey = ASTUtils.createKey('status', ASTUtils.createPosition(1, 7));
      const leftComparator = ASTUtils.createComparator('<', ASTUtils.createPosition(7, 8));
      const leftValue = ASTUtils.createValue('active', ASTUtils.createPosition(9, 15));
      const leftCondition = ASTUtils.createCondition(
        leftKey,
        leftComparator,
        leftValue,
        0,
        1,
        0,
        ASTUtils.createPosition(1, 15),
      );

      const middleKey = ASTUtils.createKey('role', ASTUtils.createPosition(20, 24));
      const middleComparator = ASTUtils.createComparator('<', ASTUtils.createPosition(24, 25));
      const middleValue = ASTUtils.createValue('admin', ASTUtils.createPosition(26, 31));
      const middleCondition = ASTUtils.createCondition(
        middleKey,
        middleComparator,
        middleValue,
        0,
        1,
        0,
        ASTUtils.createPosition(20, 31),
      );

      const andOperator = ASTUtils.createOperator('AND', ASTUtils.createPosition(16, 19));
      const andExpr = ASTUtils.createBooleanExpression(
        andOperator,
        leftCondition,
        middleCondition,
        ASTUtils.createPosition(1, 31),
      );
      const groupExpr = ASTUtils.createGroup(andExpr, ASTUtils.createPosition(0, 32));

      const rightKey = ASTUtils.createKey('name', ASTUtils.createPosition(36, 40));
      const rightComparator = ASTUtils.createComparator('<', ASTUtils.createPosition(40, 41));
      const rightValue = ASTUtils.createValue('test', ASTUtils.createPosition(42, 46));
      const rightCondition = ASTUtils.createCondition(
        rightKey,
        rightComparator,
        rightValue,
        0,
        1,
        0,
        ASTUtils.createPosition(36, 46),
      );

      const orOperator = ASTUtils.createOperator('OR', ASTUtils.createPosition(33, 35));
      const orExpr = ASTUtils.createBooleanExpression(
        orOperator,
        groupExpr,
        rightCondition,
        ASTUtils.createPosition(0, 46),
      );

      const visitedNodes: string[] = [];

      ASTUtils.traverseAST(orExpr, null, (node) => {
        visitedNodes.push(node.type);
        return true;
      });

      // OR boolean -> group (left) has AND boolean inside with 2 conditions, right has 1 condition
      expect(visitedNodes).toEqual(['boolean', 'condition', 'condition', 'condition']);
    });
  });
});

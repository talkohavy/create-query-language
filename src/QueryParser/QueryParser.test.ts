import { QueryParser } from './QueryParser';

describe('QueryParser', () => {
  let parser: QueryParser;

  beforeEach(() => {
    parser = new QueryParser();
  });

  describe('basic parsing', () => {
    test('should parse simple condition', () => {
      const result = parser.parse('status: active');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('condition');

      if (result.ast?.expression.type === 'condition') {
        expect(result.ast.expression.key.value).toBe('status');
        expect(result.ast.expression.value.value).toBe('active');
        expect(result.ast.expression.comparator.value).toBe(':');
        expect(result.ast.expression.spacesAfterKey).toBe(0);
        expect(result.ast.expression.spacesAfterComparator).toBe(1);
        expect(result.ast.expression.spacesAfterValue).toBe(0);
      }
    });

    test('should parse quoted value', () => {
      const result = parser.parse('name: "John Doe"');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('condition');

      if (result.ast?.expression.type === 'condition') {
        expect(result.ast.expression.key.value).toBe('name');
        expect(result.ast.expression.value.value).toBe('John Doe');
        expect(result.ast.expression.comparator.value).toBe(':');
      }
    });

    test('should parse different comparators', () => {
      const comparators = [':', '==', '!=', '>', '<', '>=', '<='];
      
      comparators.forEach(comp => {
        const result = parser.parse(`field ${comp} value`);
        
        expect(result.success).toBe(true);
        expect(result.ast?.expression.type).toBe('condition');
        
        if (result.ast?.expression.type === 'condition') {
          expect(result.ast.expression.comparator.value).toBe(comp);
        }
      });
    });

    test('should parse single quoted values', () => {
      const result = parser.parse("name: 'John Doe'");

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('condition');

      if (result.ast?.expression.type === 'condition') {
        expect(result.ast.expression.value.value).toBe('John Doe');
      }
    });
  });

  describe('boolean expressions', () => {
    test('should parse AND expression', () => {
      const result = parser.parse('status: active AND role: admin');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');

      if (result.ast?.expression.type === 'boolean') {
        expect(result.ast.expression.operator.value).toBe('AND');
        expect(result.ast.expression.left.type).toBe('condition');
        expect(result.ast.expression.right.type).toBe('condition');
      }
    });

    test('should parse OR expression', () => {
      const result = parser.parse('status: active OR status: pending');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');

      if (result.ast?.expression.type === 'boolean') {
        expect(result.ast.expression.operator.value).toBe('OR');
      }
    });

    test('should handle operator precedence (AND over OR)', () => {
      const result = parser.parse('status: active OR role: admin AND level: senior');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');

      if (result.ast?.expression.type === 'boolean') {
        expect(result.ast.expression.operator.value).toBe('OR');
        expect(result.ast.expression.right.type).toBe('boolean');
      }
    });

    test('should parse multiple AND operations', () => {
      const result = parser.parse('a: 1 AND b: 2 AND c: 3');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');

      if (result.ast?.expression.type === 'boolean') {
        expect(result.ast.expression.operator.value).toBe('AND');
        // Left should be a boolean expression (a: 1 AND b: 2)
        expect(result.ast.expression.left.type).toBe('boolean');
        // Right should be a condition (c: 3)
        expect(result.ast.expression.right.type).toBe('condition');
      }
    });

    test('should parse multiple OR operations', () => {
      const result = parser.parse('a: 1 OR b: 2 OR c: 3');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');

      if (result.ast?.expression.type === 'boolean') {
        expect(result.ast.expression.operator.value).toBe('OR');
        // Left should be a boolean expression (a: 1 OR b: 2)
        expect(result.ast.expression.left.type).toBe('boolean');
        // Right should be a condition (c: 3)
        expect(result.ast.expression.right.type).toBe('condition');
      }
    });

    test('should parse complex mixed operator expression with groups', () => {
      // This test specifically targets the bug where parsing stops after groups
      const input = 'key1 == v AND (key2 >= 14 OR key3 : 5) OR key4 < 1';
      const result = parser.parse(input);

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');

      if (result.ast?.expression.type === 'boolean') {
        // The top level should be an OR expression
        expect(result.ast.expression.operator.value).toBe('OR');

        // The left side should be the AND expression with the group
        expect(result.ast.expression.left.type).toBe('boolean');
        if (result.ast.expression.left.type === 'boolean') {
          expect(result.ast.expression.left.operator.value).toBe('AND');
        }

        // The right side should be the final condition
        expect(result.ast.expression.right.type).toBe('condition');
        if (result.ast.expression.right.type === 'condition') {
          expect(result.ast.expression.right.key.value).toBe('key4');
          expect(result.ast.expression.right.comparator.value).toBe('<');
          expect(result.ast.expression.right.value.value).toBe('1');
        }
      }

      // Verify that the entire input was parsed (position should match input length)
      expect(result.ast?.position.end).toBe(input.length);
    });

    test('should handle case insensitive operators', () => {
      const result = parser.parse('status: active and role: admin or level: senior');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');
    });
  });

  describe('grouped expressions', () => {
    test('should parse simple group', () => {
      const result = parser.parse('(status: active)');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('group');

      if (result.ast?.expression.type === 'group') {
        expect(result.ast.expression.expression.type).toBe('condition');
      }
    });

    test('should parse complex group', () => {
      const result = parser.parse('(status: active OR status: pending) AND role: admin');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');

      if (result.ast?.expression.type === 'boolean') {
        expect(result.ast.expression.operator.value).toBe('AND');
        expect(result.ast.expression.left.type).toBe('group');
      }
    });

    test('should handle nested groups', () => {
      const result = parser.parse('((status: active))');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('group');

      if (result.ast?.expression.type === 'group') {
        expect(result.ast.expression.expression.type).toBe('group');
      }
    });

    test('should parse groups with different operators', () => {
      const result = parser.parse('(a: 1 OR b: 2) AND (c: 3 OR d: 4)');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');

      if (result.ast?.expression.type === 'boolean') {
        expect(result.ast.expression.operator.value).toBe('AND');
        expect(result.ast.expression.left.type).toBe('group');
        expect(result.ast.expression.right.type).toBe('group');
      }
    });

    test('should handle groups with multiple levels', () => {
      const result = parser.parse('((a: 1 AND b: 2) OR (c: 3 AND d: 4))');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('group');

      if (result.ast?.expression.type === 'group') {
        expect(result.ast.expression.expression.type).toBe('boolean');
      }
    });
  });

  describe('error handling', () => {
    test('should handle empty input', () => {
      const result = parser.parse('');

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toContain('Empty query');
    });

    test('should handle missing value', () => {
      const result = parser.parse('status:');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle missing colon', () => {
      const result = parser.parse('status active');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle unbalanced parentheses', () => {
      const result = parser.parse('(status: active');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle invalid operator', () => {
      const result = parser.parse('status: active XOR role: admin');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle missing expression after AND', () => {
      const result = parser.parse('status: active AND');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.message).toContain('Expected expression after');
    });

    test('should handle missing expression after OR', () => {
      const result = parser.parse('status: active OR');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle invalid key starting with number', () => {
      const result = parser.parse('123field: value');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle extra closing parenthesis', () => {
      const result = parser.parse('status: active)');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should handle multiple errors', () => {
      const result = parser.parse('(status: AND role');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('whitespace handling', () => {
    test('should handle extra whitespace', () => {
      const result = parser.parse('  status  :  active  AND  role  :  admin  ');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');
    });

    test('should handle tabs and newlines', () => {
      const result = parser.parse('status:\tactive\nAND\nrole:\tadmin');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');
    });

    test('should track spacing information accurately', () => {
      const result = parser.parse('field  :   value    ');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('condition');

      if (result.ast?.expression.type === 'condition') {
        expect(result.ast.expression.spacesAfterKey).toBe(2);
        expect(result.ast.expression.spacesAfterComparator).toBe(3);
        expect(result.ast.expression.spacesAfterValue).toBe(4);
      }
    });

    test('should handle whitespace around parentheses', () => {
      const result = parser.parse('  (  status : active  )  ');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('group');
    });
  });

  describe('parser options', () => {
    test('should respect maxErrors option', () => {
      const limitedParser = new QueryParser({ maxErrors: 2 });
      const result = limitedParser.parse('invalid query with many errors AND more errors OR even more');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeLessThanOrEqual(2);
    });

    test('should handle unlimited errors by default', () => {
      const result = parser.parse('invalid: AND another: OR third:');

      expect(result.success).toBe(false);
      // Should capture multiple errors
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Condition Node Structure', () => {
  test('should create child nodes for key, comparator, and value with spacing info', () => {
    const parser = new QueryParser();
    const result = parser.parse('status:  active   ');

    expect(result.success).toBe(true);
    expect(result.ast?.expression.type).toBe('condition');

    if (result.ast?.expression.type === 'condition') {
      const condition = result.ast.expression;

      // Test key node
      expect(condition.key.type).toBe('key');
      expect(condition.key.value).toBe('status');
      expect(condition.key.position.start).toBe(0);
      expect(condition.key.position.end).toBe(6);

      // Test comparator node
      expect(condition.comparator.type).toBe('comparator');
      expect(condition.comparator.value).toBe(':');
      expect(condition.comparator.position.start).toBe(6);
      expect(condition.comparator.position.end).toBe(7);

      // Test value node
      expect(condition.value.type).toBe('value');
      expect(condition.value.value).toBe('active');
      expect(condition.value.position.start).toBe(9);
      expect(condition.value.position.end).toBe(15);

      // Test spacing information
      expect(condition.spacesAfterKey).toBe(0);
      expect(condition.spacesAfterComparator).toBe(2);
      expect(condition.spacesAfterValue).toBe(3);
    }
  });

  test('should handle different spacing scenarios', () => {
    const parser = new QueryParser();
    const result = parser.parse('name : "John Doe"');

    expect(result.success).toBe(true);
    expect(result.ast?.expression.type).toBe('condition');

    if (result.ast?.expression.type === 'condition') {
      const condition = result.ast.expression;

      expect(condition.spacesAfterKey).toBe(1);
      expect(condition.spacesAfterComparator).toBe(1);
      expect(condition.spacesAfterValue).toBe(0);
    }
  });
});

describe('Advanced Parser Tests', () => {
  let parser: QueryParser;

  beforeEach(() => {
    parser = new QueryParser();
  });

  describe('complex expressions', () => {
    test('should parse deeply nested expressions', () => {
      const input = 'a: 1 AND (b: 2 OR (c: 3 AND d: 4)) OR e: 5';
      const result = parser.parse(input);

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');
    });

    test('should parse expression with all comparator types', () => {
      const input = 'a: 1 AND b == 2 AND c != 3 AND d > 4 AND e < 5 AND f >= 6 AND g <= 7';
      const result = parser.parse(input);

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');
    });

    test('should parse expression with mixed quote types', () => {
      const input = 'name: "John" AND title: \'Manager\' AND department: "Sales"';
      const result = parser.parse(input);

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');
    });

    test('should parse long chain of operations', () => {
      const input = 'a: 1 OR b: 2 OR c: 3 OR d: 4 OR e: 5 OR f: 6';
      const result = parser.parse(input);

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');
    });
  });

  describe('error recovery', () => {
    test('should continue parsing after recoverable errors', () => {
      const result = parser.parse('status: active INVALID_OP role: admin');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Should still return tokens for analysis
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    test('should provide meaningful error positions', () => {
      const result = parser.parse('field: value AND');

      expect(result.success).toBe(false);
      expect(result.errors[0]?.position).toBeDefined();
      expect(result.errors[0]?.position.start).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    test('should handle single character identifiers', () => {
      const result = parser.parse('a: b');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('condition');
    });

    test('should handle numeric values', () => {
      const result = parser.parse('count: 42 AND percentage: 3');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');
    });

    test('should handle empty quoted strings', () => {
      const result = parser.parse('field: ""');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('condition');

      if (result.ast?.expression.type === 'condition') {
        expect(result.ast.expression.value.value).toBe('');
      }
    });

    test('should handle special characters in identifiers', () => {
      const result = parser.parse('field_name: value_123');

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('condition');
    });
  });

  describe('performance and stress tests', () => {
    test('should handle moderately large expressions', () => {
      // Generate a large but reasonable expression
      const conditions = Array.from({ length: 50 }, (_, i) => `field${i}: value${i}`);
      const input = conditions.join(' AND ');
      
      const result = parser.parse(input);

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('boolean');
    });

    test('should handle deep nesting', () => {
      let input = 'field: value';
      for (let i = 0; i < 10; i++) {
        input = `(${input} AND field${i}: value${i})`;
      }
      
      const result = parser.parse(input);

      expect(result.success).toBe(true);
      expect(result.ast?.expression.type).toBe('group');
    });
  });
});

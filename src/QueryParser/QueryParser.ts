import type { AddErrorProps, IQueryParser } from './QueryParser.interface';
import type { ParseError, ParseResult, QueryParserOptions, TokenContext } from './types';
import { ASTUtils, type Expression } from '../ASTUtils';
import { LogicalOperators, Comparators, type ComparatorValues } from '../logic/constants';
import { QueryLexer, TokenTypes } from '../QueryLexer';
import { TokenStream } from '../TokenStream';
import { ContextTypes, ERROR_CODES, ERROR_MESSAGES, type ContextTypeValues } from './logic/constants';

export class QueryParser implements IQueryParser {
  private tokenStream: TokenStream = new TokenStream([]);
  private errors: ParseError[] = [];
  private openParenthesisCount = 0;
  private options: QueryParserOptions;
  private queryLexer: QueryLexer;

  constructor(options: Partial<QueryParserOptions> = {}) {
    this.options = { maxErrors: 10, ...options };
    this.queryLexer = new QueryLexer();
  }

  parse(input: string): ParseResult {
    try {
      this.reset();

      // Tokenize input
      const tokens = this.queryLexer.tokenize(input);
      this.tokenStream = new TokenStream(tokens);

      // Skip leading whitespace
      this.tokenStream.countAndSkipWhitespaces({
        expectedTokens: [ContextTypes.Key, ContextTypes.LeftParenthesis, ContextTypes.Not],
      });

      // Check for empty input
      if (this.tokenStream.isAtEnd()) {
        const errorEmptyInputPosition = ASTUtils.createPosition(0, 0);
        this.addError({
          message: ERROR_MESSAGES.EMPTY_QUERY,
          position: errorEmptyInputPosition,
          code: ERROR_CODES.EMPTY_EXPRESSION,
        });

        return { success: false, errors: this.errors, tokens };
      }

      // Parse the expression
      const expression = this.parseOrExpression();

      if (!expression) return { success: false, errors: this.errors, tokens };

      // Check for unexpected tokens at end
      this.tokenStream.countAndSkipWhitespaces({ expectedTokens: [] });

      if (!this.tokenStream.isAtEnd()) {
        const token = this.tokenStream.current()!;

        const expectedTokens: ContextTypeValues[] = [];

        if (this.isPartialLogicalOperator(token.value)) {
          expectedTokens.push(ContextTypes.LogicalOperator);
        }

        /**
         * When no other errors, it means that the query up to this point is valid,
         * so we add an error to suggest a logical operator.
         */
        if (this.errors.length === 0) {
          this.addError({
            message: ERROR_MESSAGES.EXPECTED_OPERATOR,
            position: token.position,
            code: ERROR_CODES.UNEXPECTED_TOKEN,
          });
        }

        token.context = { expectedTokens };
      }

      const queryPosition = ASTUtils.createPosition(0, input.length);
      const queryAST = ASTUtils.createQuery(expression, queryPosition);

      return {
        success: this.errors.length === 0,
        ast: queryAST,
        errors: this.errors,
        tokens,
      };
    } catch (error) {
      const errorPosition = ASTUtils.createPosition(0, input.length);
      this.addError({
        message: error instanceof Error ? error.message : 'Unknown parsing error',
        position: errorPosition,
        code: ERROR_CODES.SYNTAX_ERROR,
      });

      return { success: false, errors: this.errors, tokens: [] };
    }
  }

  private reset(): void {
    this.errors = [];
    this.openParenthesisCount = 0;
  }

  /**
   * Parse OR expressions (lowest precedence)
   */
  private parseOrExpression(): Expression | null {
    let leftAST = this.parseAndExpression();

    if (!leftAST) return null;

    while (this.matchLogicalOperatorOR()) {
      const operatorToken = this.tokenStream.consume()!;

      operatorToken.context = { expectedTokens: [ContextTypes.LogicalOperator] };

      this.tokenStream.countAndSkipWhitespaces({
        expectedTokens: [ContextTypes.Key, ContextTypes.LeftParenthesis, ContextTypes.Not],
      });

      const rightAST = this.parseAndExpression();

      if (!rightAST) return leftAST;

      // Create operator node with position information
      const logicalOperatorNode = ASTUtils.createOperator(LogicalOperators.OR, operatorToken.position);

      const leftPosition = ASTUtils.mergePositions(leftAST.position, rightAST.position);
      leftAST = ASTUtils.createBooleanExpression(logicalOperatorNode, leftAST, rightAST, leftPosition);
    }

    return leftAST;
  }

  /**
   * Parse AND expressions (higher precedence than OR)
   */
  private parseAndExpression(): Expression | null {
    let leftAST = this.parseNotExpression();

    if (!leftAST) return null;

    const context: TokenContext = { expectedTokens: [ContextTypes.LogicalOperator] };
    if (this.openParenthesisCount > 0) {
      context.expectedTokens.push(ContextTypes.RightParenthesis);
    }
    this.tokenStream.countAndSkipWhitespaces(context);

    while (this.matchLogicalOperatorAND()) {
      const operatorToken = this.tokenStream.consume()!;
      operatorToken.context = { expectedTokens: [ContextTypes.LogicalOperator] };

      const whiteSpacesAfterLogicalOperatorCount = this.tokenStream.countAndSkipWhitespaces({
        expectedTokens: [ContextTypes.Key, ContextTypes.LeftParenthesis, ContextTypes.Not],
      });

      // Check if we're at end of input after AND
      if (this.tokenStream.isAtEnd()) {
        const errorPosition = this.getPositionAfterToken(operatorToken);
        errorPosition.end += whiteSpacesAfterLogicalOperatorCount;

        this.addError({
          message: ERROR_MESSAGES.EXPECTED_EXPRESSION_AFTER_AND,
          position: errorPosition,
          code: ERROR_CODES.MISSING_TOKEN,
        });

        return leftAST;
      }

      const rightAST = this.parseNotExpression();

      if (!rightAST) return leftAST;

      // Create operator node with position information
      const logicalOperatorNode = ASTUtils.createOperator(LogicalOperators.AND, operatorToken.position);

      const leftPosition = ASTUtils.mergePositions(leftAST.position, rightAST.position);
      leftAST = ASTUtils.createBooleanExpression(logicalOperatorNode, leftAST, rightAST, leftPosition);

      const context: TokenContext = { expectedTokens: [ContextTypes.LogicalOperator] };
      if (this.openParenthesisCount > 0) {
        context.expectedTokens.push(ContextTypes.RightParenthesis);
      }
      this.tokenStream.countAndSkipWhitespaces(context);
    }

    return leftAST;
  }

  /**
   * Parse NOT expressions (highest precedence for unary operators)
   */
  private parseNotExpression(): Expression | null {
    this.tokenStream.countAndSkipWhitespaces({
      expectedTokens: [ContextTypes.Key, ContextTypes.LeftParenthesis, ContextTypes.Not],
    });

    // Check if current token is NOT
    if (this.matchLogicalOperatorNOT()) {
      const notToken = this.tokenStream.consume()!;

      notToken.context = { expectedTokens: [ContextTypes.Not] };

      const whiteSpacesAfterNotCount = this.tokenStream.countAndSkipWhitespaces({
        expectedTokens: [ContextTypes.Key, ContextTypes.LeftParenthesis],
      });

      // Check if we're at end of input after NOT
      if (this.tokenStream.isAtEnd()) {
        const errorPosition = this.getPositionAfterToken(notToken);
        errorPosition.end += whiteSpacesAfterNotCount;

        this.addError({
          message: ERROR_MESSAGES.EXPECTED_EXPRESSION_AFTER_NOT,
          position: errorPosition,
          code: ERROR_CODES.MISSING_TOKEN,
        });

        return null;
      }

      const expression = this.parsePrimaryExpression();

      if (!expression) return null;

      const notPosition = ASTUtils.mergePositions(notToken.position, expression.position);
      const notAST = ASTUtils.createNotExpression(expression, notPosition);

      return notAST;
    }

    // If not a NOT expression, parse as primary expression
    return this.parsePrimaryExpression();
  }

  /**
   * Parse primary expressions (conditions and groups)
   */
  private parsePrimaryExpression(): Expression | null {
    this.tokenStream.countAndSkipWhitespaces({
      expectedTokens: [ContextTypes.Key, ContextTypes.LeftParenthesis, ContextTypes.Not],
    });

    // Handle grouped expressions
    if (this.tokenStream.isCurrentAMatchWith(TokenTypes.LeftParenthesis)) {
      const groupExpression = this.parseGroupExpression();

      return groupExpression;
    }

    // Handle conditions
    const parsedCondition = this.parseCondition();

    return parsedCondition;
  }

  /**
   * Parse grouped expression (parentheses)
   */
  private parseGroupExpression(): Expression | null {
    const startToken = this.tokenStream.tryGetCurrent(TokenTypes.LeftParenthesis);

    startToken.context = { expectedTokens: [ContextTypes.Key, ContextTypes.LeftParenthesis, ContextTypes.Not] };
    this.openParenthesisCount++;

    this.tokenStream.countAndSkipWhitespaces({
      expectedTokens: [ContextTypes.Key, ContextTypes.LeftParenthesis, ContextTypes.Not],
    });

    // Check for empty parentheses
    if (this.tokenStream.isCurrentAMatchWith(TokenTypes.RightParenthesis)) {
      this.addError({
        message: ERROR_MESSAGES.EMPTY_PARENTHESES,
        position: startToken.position,
        code: ERROR_CODES.EMPTY_EXPRESSION,
      });

      this.tokenStream.consume(); // consume the closing parenthesis
      this.openParenthesisCount--;

      return null;
    }

    const expression = this.parseOrExpression();

    if (!expression) {
      this.addError({
        message: ERROR_MESSAGES.EXPECTED_EXPRESSION_IN_PARENTHESES,
        position: startToken.position,
        code: ERROR_CODES.MISSING_TOKEN,
      });

      return null;
    }

    const context: TokenContext = { expectedTokens: [ContextTypes.Comparator] };
    if (this.openParenthesisCount > 1) {
      context.expectedTokens.push(ContextTypes.RightParenthesis);
    }

    this.tokenStream.countAndSkipWhitespaces(context);

    if (!this.tokenStream.isCurrentAMatchWith(TokenTypes.RightParenthesis)) {
      this.addError({
        message: ERROR_MESSAGES.EXPECTED_CLOSING_PARENTHESES,
        position: expression.position,
        code: ERROR_CODES.UNBALANCED_PARENTHESES,
      });

      return expression; // Return what we have for error recovery
    }

    const rightParenthesisToken = this.tokenStream.consume()!;

    rightParenthesisToken.context = { expectedTokens: [ContextTypes.RightParenthesis] };

    this.openParenthesisCount--;

    const groupPosition = ASTUtils.mergePositions(startToken.position, rightParenthesisToken.position);
    const groupAST = ASTUtils.createGroup(expression, groupPosition);

    return groupAST;
  }

  /**
   * Parse condition expression (key comparator value)
   */
  private parseCondition(): Expression | null {
    // Expect identifier for key
    const currentToken = this.tokenStream.current()!;

    const isValidKeyToken =
      (this.tokenStream.isCurrentAMatchWith(TokenTypes.Identifier) && !/^\d/.test(currentToken.value)) ||
      this.tokenStream.isCurrentAMatchWith(TokenTypes.QuotedString);

    if (!isValidKeyToken) {
      this.addError({
        message: ERROR_MESSAGES.EXPECTED_KEY,
        position: currentToken?.position || ASTUtils.createPosition(0, 0),
        code: ERROR_CODES.MISSING_TOKEN,
      });

      return null;
    }

    const keyToken = this.tokenStream.consume()!;
    keyToken.context = { expectedTokens: [ContextTypes.Key] };

    // suggest NOT as an alternative to key (e.g., "no" could be either "notification" or "NOT")
    if (this.isPartialNotOperator(keyToken.value)) {
      keyToken.context.expectedTokens.push(ContextTypes.Not);
    }

    const spacesAfterKey = this.tokenStream.countAndSkipWhitespaces({
      expectedTokens: [ContextTypes.Comparator, ContextTypes.Colon],
    });

    // Expect comparator
    if (!this.tokenStream.matchAny(TokenTypes.Colon, TokenTypes.Comparator)) {
      const token = this.tokenStream.current()!;

      const expectedTokens: ContextTypeValues[] = [];

      if (this.isPartialComparator(token.value)) {
        expectedTokens.push(ContextTypes.Comparator);
      }

      token.context = { expectedTokens };

      this.addError({
        message: ERROR_MESSAGES.EXPECTED_COMPARATOR,
        position: token?.position || keyToken.position,
        code: ERROR_CODES.MISSING_TOKEN,
      });

      return null;
    }

    const comparatorToken = this.tokenStream.consume()!;
    comparatorToken.context = { expectedTokens: [ContextTypes.Comparator, ContextTypes.Colon] };

    const spacesAfterComparator = this.tokenStream.countAndSkipWhitespaces({
      expectedTokens: [ContextTypes.Value],
      key: keyToken.value,
    });

    // Expect value (identifier or quoted string)
    if (!this.tokenStream.matchAny(TokenTypes.Identifier, TokenTypes.QuotedString)) {
      const valueToken = this.tokenStream.current();

      this.addError({
        message: ERROR_MESSAGES.EXPECTED_VALUE,
        position: valueToken?.position || comparatorToken.position,
        code: ERROR_CODES.MISSING_TOKEN,
      });

      return null;
    }

    const valueToken = this.tokenStream.consume()!;
    valueToken.context = { expectedTokens: [ContextTypes.Value], key: keyToken.value };

    const context: TokenContext = { expectedTokens: [ContextTypes.LogicalOperator] };
    if (this.openParenthesisCount > 0) {
      context.expectedTokens.push(ContextTypes.RightParenthesis);
    }
    const spacesAfterValue = this.tokenStream.countAndSkipWhitespaces(context);

    // Create child nodes
    const keyNode = ASTUtils.createKey(keyToken.value, keyToken.position);
    const comparatorNode = ASTUtils.createComparator(
      comparatorToken.value as ComparatorValues,
      comparatorToken.position,
    );
    const valueNode = ASTUtils.createValue(valueToken.value, valueToken.position);

    const conditionPosition = ASTUtils.mergePositions(keyToken.position, valueToken.position);

    const conditionAST = ASTUtils.createCondition(
      keyNode,
      comparatorNode,
      valueNode,
      spacesAfterKey,
      spacesAfterComparator,
      spacesAfterValue,
      conditionPosition,
    );

    return conditionAST;
  }

  /**
   * Check if current token matches a boolean operator
   */
  private matchLogicalOperatorAND(): boolean {
    const token = this.tokenStream.current();

    if (!token) return false;

    const isAndOperator = token.type === TokenTypes.AND;

    return isAndOperator;
  }

  /**
   * Check if current token matches a boolean operator
   */
  private matchLogicalOperatorOR(): boolean {
    const token = this.tokenStream.current();

    if (!token) return false;

    const isOrOperator = token.type === TokenTypes.OR;

    return isOrOperator;
  }

  /**
   * Check if current token matches NOT operator
   */
  private matchLogicalOperatorNOT(): boolean {
    const token = this.tokenStream.current();

    if (!token) return false;

    const isNotOperator = token.type === TokenTypes.NOT;

    return isNotOperator;
  }

  private addError(props: AddErrorProps): void {
    const { code, message, position } = props;

    const error: ParseError = {
      message,
      position: {
        start: position.start,
        end: position.end,
      },
      recoverable: true,
    };

    // Add error code for programmatic handling
    (error as any).code = code;

    this.errors.push(error);

    // Stop parsing if we hit max errors
    if (this.errors.length >= this.options.maxErrors) {
      throw new Error(`Too many parse errors (${this.options.maxErrors})`);
    }
  }

  /**
   * Get position after a token for error reporting
   */
  private getPositionAfterToken(token: any): { start: number; end: number } {
    return {
      start: token.position.end,
      end: token.position.end,
    };
  }

  private isPartialLogicalOperator(value: string): boolean {
    const lowercasedIncompleteValue = value.toLowerCase();
    return [TokenTypes.AND, TokenTypes.OR, TokenTypes.NOT].some((op) =>
      op.toLowerCase().startsWith(lowercasedIncompleteValue),
    );
  }

  private isPartialNotOperator(value: string): boolean {
    const lowercasedIncompleteValue = value.toLowerCase();

    return TokenTypes.NOT.toLowerCase().startsWith(lowercasedIncompleteValue);
  }

  private isPartialComparator(value: string): boolean {
    const comparators = Object.values(Comparators);
    return comparators.some((fullComparator) => fullComparator.startsWith(value));
  }
}

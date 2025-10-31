# create-query-language

## 1.1.1

### Patch Changes

- Export Position type.

## 1.1.0

### Minor Changes

- - Auto-complete now works on partial operators.
  - BugFix: Error of ERROR_MESSAGES.EXPECTED_OPERATOR should only be added if there are no other errors.
- BugFix: NOT is now an auto-complete option after a valid expression.
- BugFix: key & left-parenthesis & NOT are all valid types after a left-parenthesis.
- BugFix: a right-parenthesis is a valid type after a right-parenthesis.
- BugFix: COLON is removed as a valid type when currently typing a key.
- BugFix: Support NOT as an alternative to key (e.g. "no" could be either "notification" or "NOT").
- BugFIx: Added COLON as a valid type when on comparator token type.
- BugFix: Added "!" to isPartialComparator's list.
- Added LinkedList relation between tokens in the QueryLexer.

### Patch Changes

- Added a help comment on the caseSensitiveOperators prop of the QueryLexer.
- Renamed BooleanOperators to LogicalOperators
- Improved logic of ASTUtils.traverseAST(). It now also traverses Query Expressions, and it invoke callback on Condition node, and not 3 times on each of its children (key, comparator and value)

## 1.0.9

### Patch Changes

- Update the documentation to let users know about the new NOT.

## 1.0.8

### Patch Changes

- Added support to NOT operator.
- Exporting SpecialChars constant from QueryLexer.
- Now exporting SpecialChars as constant.

## 1.0.7

### Patch Changes

- QueryParser: a key can now also be a quoted string.

## 1.0.6

### Patch Changes

- QueryParser enhance: Value token also needs a key reference in its token.

## 1.0.5

### Patch Changes

- added getTokenAtPosition static function to QueryLexer.

## 1.0.4

### Patch Changes

- Remove colon ':' from Comparators

## 1.0.3

### Patch Changes

- QueryParserOptions

## 1.0.2

### Patch Changes

- README.md - smaller image

## 1.0.1

### Patch Changes

- README.md updated

## 1.0.0

### Major Changes

- First Release.

## 0.0.3

### Patch Changes

- Export the entire common folder (i.e. BooleanOperators).

## 0.0.2

### Patch Changes

- export types from main file

## 0.0.1

### Patch Changes

- Create Query Language - First release

---
"create-query-language": patch
---

Improved logic of ASTUtils.traverseAST(). It now also traverses Query Expressions, and it invoke callback on Condition node, and not 3 times on each of its children (key, comparator and value)

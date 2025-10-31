---
"create-query-language": minor
---

- Auto-complete now works on partial operators.
- BugFix: Error of ERROR_MESSAGES.EXPECTED_OPERATOR should only be added if there are no other errors.
- BugFix: NOT is now an auto-complete option after a valid expression.
- BugFix: key & left-parenthesis & NOT are all valid types after a left-parenthesis.
- BugFix: a right-parenthesis is a valid type after a right-parenthesis.
- BugFix: COLON is removed as a valid type when currently typing a key.
- BugFix: Support NOT as an alternative to key (e.g. "no" could be either "notification" or "NOT").
- BugFIx: Added COLON as a valid type when on comparator token type.
- BugFix: Added "!" to isPartialComparator's list.

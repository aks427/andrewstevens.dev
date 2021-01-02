---
title: "Write a simple formula parser in JavaScript"
date: "2021-01-01"
---

In this post I want to show how to add simple formula functionality to a JavaScript application. This will include:

- A code editor with syntax highlighting and validation
- A formula evaluator that calculates the result based on input data

> There are existing open source libraries that are probably better to use in production, but it is important to understand how things work.
> I recently used [CodeMirror](https://codemirror.net/) (with a custom mode) for a formula editor to use with an existing in-house calculation engine.

#### We're going to do the following steps:

1. Define our formula syntax
2. Write a lexer that parses our formula into tokens
3. Write a code editor that has syntax highlighting
4. Add extra validation to our code editor
5. Write a formula evaluator

---

### 1. Formula Syntax

We're going to base our syntax on a typical spreadsheet formula, which is one the most well known formula syntaxes.

#### Our syntax will support the following:

- String and Number Values
  - `3`, `"some string"`
- Operators
  - `+`, `-`, `*`, `/`, `&`
- Functions
  - `Upper()`, `Round()`
- References

  - A typical spreadsheet would use `A1` as a reference, but since we're not using this for a spreadsheet, we're going to change this.
  - Our references will be based on key/value pairs that are passed in as input values. They will be referenced by the name of the key surrounded by brackets: `[key name]`

  | Examples                             | Result                   |
  | ------------------------------------ | ------------------------ |
  | `2 + 4`                              | `6`                      |
  | `"Lowercase name: " & Upper([Name])` | `Lowercase name: ANDREW` |

---

### 2. Lexer

TODO

---

### 3. Code Editor

TODO

---

### 4. Validation

TODO

---

### 5. Evaluation

TODO

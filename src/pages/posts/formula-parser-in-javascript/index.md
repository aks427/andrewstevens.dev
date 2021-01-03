---
title: 'Write a simple formula parser in JavaScript'
date: '2021-01-02'
---

In this post I want to show how to add simple formula functionality to a JavaScript application. This will include:

- A code editor with syntax highlighting and validation
- A formula evaluator that calculates the result based on input data

> There are existing open source libraries that are probably better to use in production, but this post will hopefully give a general idea how things work.
> I recently used [CodeMirror](https://codemirror.net/) (with a custom mode) for a formula editor to use with an existing in-house calculation engine. I based some of the Lexer concepts on CodeMirror.

Here is a [Live Example](/posts/formula-parser-in-javascript/example) of it all working end to end. You can also try it out and follow along on [CodeSandbox](https://codesandbox.io/s/simple-formula-parser-bxin6)

#### We're going to do the following steps:

1. Define our formula syntax
2. Write a lexer that parses our formula into tokens
3. Add a validator based on the tokens
4. Write a code editor that uses the tokens for syntax highlighting
5. Write a formula evaluator

---

### 1. Formula Syntax

We're going to base our syntax on a typical spreadsheet formula, which is one of the most well known formula syntaxes.

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
  | `"Uppercase name: " & Upper([Name])` | `Uppercase name: ANDREW` |

---

### 2. Lexer

We're going to have two main components for the tokenization process:

- Lexer
- SyntaxTokenizer

The Lexer will be generic and in theory work with any syntax. This is the core component that will power everything else. It takes a string and turns it into an array of tokens. A more complicated Lexer would handle multiple lines, but that isn't needed for our formula expression.

A token contains a type and a value. Given an input of `1 + 2`, the tokens will look like this:

```javascript
[
  {
    value: '1',
    type: 'number',
  },
  {
    value: ' ',
    type: 'whitespace',
  },
  {
    value: '+',
    type: 'operator',
  },
  {
    value: ' ',
    type: 'whitespace',
  },
  {
    value: '2',
    type: 'number',
  },
];
```

The Lexer will call the SyntaxTokenizer in a while loop until it processes the entire string. The SyntaxTokenizer must move the position forward every time it is called. The Lexer provides the following methods to the SyntaxTokenizer:

- isEnd()
  - Returns whether or not we're at the end of the string.
- peek()
  - Returns the next character in the string, but does not move the position forward.
- match(pattern, consume)
  - Returns the regex pattern match for the remaining part of the string. The pattern must begin with `^` to ensure that it only matches the first part of the string. It returns `null` if there is no match.
  - The `consume` parameter controls whether or not the position should move forward by the number of characters in the match.
- next()
  - Moves the position forward by 1
- getPreviousToken()
  - Gets the previous non-whitespace character. Returns null if there is none.

Here is what `Lexer.js` looks like:

```javascript
export function Lexer(formula, syntaxTokenizer) {
  let position = 0;
  const tokens = [];

  const isEnd = () => {
    return position >= formula.length;
  };
  const peek = () => {
    if (isEnd()) {
      return null;
    }
    return formula.substring(position, position + 1);
  };
  const match = (pattern, consume) => {
    const restOfFormula = formula.substring(position);
    const match = restOfFormula.match(pattern);
    if (!match || match.length > 1) {
      return null;
    }
    if (consume) {
      position += match[0].length;
    }
    return match[0] || null;
  };
  const next = () => {
    position += 1;
    return peek();
  };
  const getPreviousToken = () => {
    for (let i = tokens.length - 1; i >= 0; i--) {
      if (tokens[i].type !== 'whitespace') {
        return tokens[i];
      }
    }
    return null;
  };

  while (!isEnd()) {
    const startingPosition = position;
    const tokenType = syntaxTokenizer({ peek, match, next, isEnd, getPreviousToken });

    if (startingPosition === position) {
      throw 'Tokenizer did not move forward';
    }

    const token = {
      value: formula.substring(startingPosition, position),
      type: tokenType,
    };

    tokens.push(token);
  }

  return tokens;
}
```

<br />

The SyntaxTokenizer is the part that implements our actual syntax. It is called repeatedly until the end of the string is reached. It can categorize one or more characters as a token.

The token type is definied by the return value. The number of characters that match is defined by how far the position was moved forward. The position is moved forward by using the `next()` method or by passing in `true` as the second parameter of the `match()` method.

To keep things simple for this code snippet, we're going to start by only supporting numbers, operators and whitespace.

```javascript{numberLines: true}
export function SyntaxTokenizer(stream) {
  const peek = stream.peek();

  // handle numbers
  if (stream.match(/^[-]?\d*\.?\d+/, true)) {
    return 'number';
  }

  // handle operators
  if (['&', '*', '-', '+', '/'].indexOf(peek) > -1) {
    stream.next();
    return 'operator';
  }

  // handle whitespace
  if (stream.match(/^ +/, true)) {
    return 'whitespace';
  }

  // mark anything else as an error
  stream.next();
  return 'error';
}
```

This would be enought to handle the previous example formula of `1 + 2`, and output the list of tokens in the earlier example.

The regex pattern (`/^[-]?\d*\.?\d+/`) on line 5 breaks down like this:

- `^` ensures it starts at the start of the string. This is required for all patterns
- `[-]?` optionally starts with `-` for negative numbers
- `\d*` matches zero or more digits
- `.?` optionally matches one period for decimal numbers
- `\d+` matches one or more digits

If the pattern matches then it returns the matching value. For our first time through, this will return the value of `1` for our example. Any string value is truthy so this will evaluate as true for the if condition and return the type as `number`.

We passed in `true` for the consume parameter, so it advanced the position forward by the number of characters in the match.

After the return, the function will then be called again, and then match for whitespace, then operator, then whitespace, and so on until it gets to the end.

Here is a complete version of `SyntaxTokenizer.js` that supports our entire syntax:

```javascript
export function SyntaxTokenizer(stream) {
  const peek = stream.peek();
  const previousToken = stream.getPreviousToken();
  const previousTokenType = previousToken ? previousToken.type : null;

  // handle double quotes
  if (peek === '"') {
    stream.next();
    if (previousTokenType === 'string' || previousTokenType === 'start quote') {
      return 'end quote';
    }
    return 'start quote';
  }

  // handle strings inside of quotes
  if (peek !== '"' && previousTokenType === 'start quote' && previousToken.value === '"') {
    if (stream.match(/^[^"]+(?=")/, true)) {
      return 'string';
    } else {
      // didn't find end quote so select all the way to the end
      stream.match(/^[^"]+/, true);
      return 'string';
    }
  }

  // handle numbers
  if (stream.match(/^[-]?\d*\.?\d+/, false)) {
    if (peek === '-' && previousTokenType !== 'operator' && tokenIsValue(previousToken)) {
      // if this number is starting with a minus and there is no previous operator, then we need to be treating this as an operator instead
      stream.next();
      return 'operator';
    }
    stream.match(/^[-]?\d*\.?\d+/, true);
    return 'number';
  }

  // handle operators
  if (['&', '*', '-', '+', '/'].indexOf(peek) > -1) {
    stream.next();
    return 'operator';
  }

  // handle references
  if (previousTokenType === 'bracket' && previousToken.value === '[' && stream.match(/^[^[\]]+(?=\])/, true)) {
    return 'reference-name';
  }

  // handle functions
  if (stream.match(/^[a-zA-Z_]\w*(?=\()/, true)) {
    return 'function-name';
  }

  // handle brackets
  if ([')', ']', '(', '['].indexOf(peek) > -1) {
    stream.next();
    return 'bracket';
  }

  // handle comma
  if (peek === ',') {
    stream.next();
    return 'comma';
  }

  // handle whitespace
  if (stream.match(/^ +/, true)) {
    return 'whitespace';
  }

  // mark anything else as an error
  stream.next();
  return 'error';
}

export function tokenIsValue(token) {
  if (!token) {
    return false;
  }
  if (token.type === 'number' || token.type === 'end quote') {
    return true;
  }
  if (token.type === 'bracket' && (token.value === ')' || token.value === ']')) {
    return true;
  }
  return false;
}
```

---

### 3. Validation

To validate our tokens we're going to iterate each token and do some checks on if it is valid. Almost all of the checks will involve checking what the previous token is. For our syntax, there are conceptually `value` types and `operation` types. Our syntax requires that the value and operation types alternate and aren't ever next to each other.

We also have to keep track of opening and closing brackets and quotes to make sure there are corresponding opening and closing ones. We keep track of that in the `unclosedTokens` array.

```javascript
import { HasFunction } from './Functions';
import { tokenIsValue } from './SyntaxTokenizer';

export function ValidateTokens(tokens) {
  const errors = [];
  const unclosedTokens = [];
  let previousToken = null;
  let functionLevel = 0;
  const nonWhitespaceTokens = tokens.filter(token => token.type !== 'whitespace');

  for (let i = 0; i < nonWhitespaceTokens.length; i++) {
    const token = nonWhitespaceTokens[i];

    const previousTokenType = previousToken ? previousToken.type : null;

    if (token.type === 'operator') {
      if (!tokenIsValue(previousToken)) {
        errors.push({ token, error: `Unexpected operator '${token.value}'` });
      }
      if (i === nonWhitespaceTokens.length - 1) {
        errors.push({ token, error: `Value expected after operator '${token.value}'` });
      }
    }

    if (token.type === 'number') {
      if (!checkIfValueIsAllowed(previousToken)) {
        errors.push({ token, error: 'An operator is required before the number' });
      }
    }

    if (token.type === 'function-name') {
      if (!checkIfValueIsAllowed(previousToken)) {
        errors.push({ token, error: 'An operator is required before the function' });
      }

      if (!HasFunction(token.value)) {
        errors.push({ token, error: `'${token.value}' is not a valid function` });
      }
    }

    if (token.type === 'start quote') {
      unclosedTokens.push({ text: '"', type: 'reference', token });

      if (!checkIfValueIsAllowed(previousToken)) {
        errors.push({ token, error: 'An operator is required before the string' });
      }
    }

    if (token.type === 'end quote') {
      if (unclosedTokens.length > 0 && unclosedTokens[unclosedTokens.length - 1].text === '"') {
        unclosedTokens.pop();
      }
    }

    if (token.type === 'comma') {
      if (!functionLevel > 0) {
        errors.push({ token, error: `Unexpected ','` });
      }
      if (!tokenIsValue(previousToken)) {
        errors.push({ token, error: `Unexpected ','` });
      }
    }

    if (token.type === 'bracket') {
      if (token.value === '(') {
        unclosedTokens.push({ text: '(', type: previousTokenType === 'function-name' ? 'function' : 'group', token });

        if (previousTokenType === 'function-name') {
          functionLevel += 1;
        }

        if (previousTokenType !== 'function-name' && !checkIfValueIsAllowed(previousToken)) {
          errors.push({ token, error: 'An operator is required before the parenthesis' });
        }
      }

      if (token.value === ')') {
        if (unclosedTokens.length > 0 && unclosedTokens[unclosedTokens.length - 1].text === '(') {
          if (unclosedTokens[unclosedTokens.length - 1].type === 'function') {
            functionLevel--;
          }

          unclosedTokens.pop();

          if (!tokenIsValue(previousToken) && !(previousTokenType === 'start-parenthesis' && unclosedTokens[unclosedTokens.length - 1].type === 'function')) {
            errors.push({ token, error: `Unexpected ')'` });
          }
        } else {
          errors.push({ token, error: `Unexpected ')'` });
        }
      }

      if (token.value === '[') {
        unclosedTokens.push({ text: '[', type: 'reference', token });

        if (!checkIfValueIsAllowed(previousToken)) {
          errors.push({ token, error: 'An operator is required before the reference' });
        }
      }

      if (token.value === ']') {
        if (unclosedTokens.length > 0 && unclosedTokens[unclosedTokens.length - 1].text === '[') {
          if (previousTokenType !== 'reference-name') {
            errors.push({ token, error: 'A reference name is required in the brackets' });
          }
          unclosedTokens.pop();
        } else {
          errors.push({ token, error: `Unexpected ']'` });
        }
      }
    }

    previousToken = token;
  }

  for (const unclosedToken of unclosedTokens) {
    let reversedToken = unclosedToken.text;
    if (unclosedToken.text === '(') {
      reversedToken = ')';
    } else if (unclosedToken.text === '[') {
      reversedToken = ']';
    }
    errors.push({ token: unclosedToken.token, error: `Missing closing '${reversedToken}'` });
  }

  return errors;
}

function checkIfValueIsAllowed(previousToken) {
  if (!previousToken) {
    return true;
  }

  if (previousToken.type === 'operator' || previousToken.type === 'comma' || (previousToken.type === 'bracket' && previousToken.value === '(')) {
    return true;
  }
  return false;
}
```

Note: we'll implement the `HasFunction()` function in the last step.

This will return an array of errors objects that contain an error message and the token it is for.

---

### 4. Code Editor

Now that we have our tokens and validation, we're ready to implement our code editor.

To implement this editor we're going to create a `<textarea />` field and overlay it with a `<div />` tag. We're going to make the textarea text transparent, and line up the div text directly with the textarea. Each token will be a `<span />` tag with a class of the token type.

I'm going to use React for this example, but this could be just as easily done with other frameworks or just plain JavaScript.

This is our `FormulaEditor.js` file:

```javascript{numberLines: true}
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Lexer } from './Lexer';
import { SyntaxTokenizer } from './SyntaxTokenizer';
import { ValidateTokens } from './Validation';
import './FormulaEditor.scss';

export function FormulaEditor(props) {
  const { value, onChange, onErrorsChanged, onTokensChanged } = props;
  const inputRef = useRef();
  const formattedRef = useRef();
  const [textareaHeight, setTextareaHeight] = useState(30);
  const [tokens, setTokens] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const t = Lexer(value, SyntaxTokenizer);
    const e = ValidateTokens(t);
    setTokens(t);
    setErrors(e);
    if (onTokensChanged) {
      onTokensChanged(t);
    }
    if (onErrorsChanged) {
      onErrorsChanged(e);
    }
  }, [value, onTokensChanged, onErrorsChanged]);

  useLayoutEffect(() => {
    const inputRefCurrent = inputRef.current;
    const onInputScroll = () => {
      formattedRef.current.scrollTop = inputRef.current.scrollTop;
      formattedRef.current.scrollLeft = inputRef.current.scrollLeft;
    };

    inputRefCurrent.addEventListener('scroll', onInputScroll);
    return () => {
      inputRefCurrent.removeEventListener('scroll', onInputScroll);
    };
  }, [inputRef]);

  useLayoutEffect(() => {
    const updateInputHeight = () => {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight + 2, 200)}px`;
      setTextareaHeight(inputRef.current.scrollHeight + 2); // add 1px for top and bottom borders
    };

    updateInputHeight();
  }, [value]);

  const textareaOnChange = e => {
    let v = e.target.value;
    if (v) {
      // disable multiline
      v = v.replace(/(?:\r\n|\r|\n)/g, '');
    }
    onChange(v);
  };

  return (
    <div className="formula-editor">
      <textarea
        value={value}
        onChange={textareaOnChange}
        className="formula-editor-textarea"
        ref={inputRef}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        height={textareaHeight}
        rows={1}
      />
      <div className="formula-editor-formatted" ref={formattedRef}>
        {formatText(tokens, errors)}
      </div>
    </div>
  );
}

function formatText(tokens, errors) {
  let formattedText = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const classNames = [token.type];

    const errorsForToken = errors.filter(x => x.token === token);
    if (errorsForToken.length > 0) {
      classNames.push('error');
    }

    formattedText.push(
      <span key={i} className={classNames.join(' ')}>
        {token.value}
      </span>
    );
  }

  return formattedText;
}
```

The `useEffect` on line 15 is run any time the `value` prop is updated. This runs the Lexer to get the list of tokens on line 16, and then get the validation errors on line 17. We set those in the local state, and then execute the optional `onTokensChanged()` and `onErrorsChanged()` props.

The `useLayoutEffect` on line 28 keeps the scroll of the div tag in sync with the textarea.

The `useLayoutEffect` on line 41 lets the textarea grow as the text wraps onto new lines.

The `formatText()` function on line 81 is what turns the tokens into a list of `<span />` tags with the proper text and class.

This is the FormulaEditor.scss file (using SASS):

```css
.formula-editor {
  position: relative;

  .formula-editor-textarea {
    resize: none;
    width: 100%;
    color: transparent;
    caret-color: #000;
    border: 1px solid #333;
    padding: 4px;
    font-family: monospace;
    letter-spacing: normal;
    font-size: 14px;

    &::selection {
      color: transparent;
      background: #eee;
    }
  }

  .formula-editor-formatted {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 0px;
    bottom: 8px;
    border: 1px solid transparent;
    padding: 4px;
    font-family: monospace;
    letter-spacing: normal;
    font-size: 14px;
    white-space: pre-wrap;
    pointer-events: none;
    overflow-y: auto;

    .string,
    .quote {
      color: #a11;
    }

    .number {
      color: #164;
    }

    .function-name {
      color: #07a;
    }

    .reference-name {
      color: #05a;
    }

    .operator,
    .comma {
      color: #838c90;
    }

    .bracket {
      color: #997;
    }

    .error,
    .unfinished-formula {
      color: red;
    }
  }
}
```

The `<FormulaEditor />` component can then be used something like this:

```javascript
import React, { useState } from 'react';
import { FormulaEditor } from './FormulaEditor';

export default () => {
  const [formula, setFormula] = useState(`"Hello " & [First Name] & "! " & Round(1.2 + [Some Number])`);
  const [errors, setErrors] = useState([]);
  const [tokens, setTokens] = useState([]);

  return (
    <div>
      <FormulaEditor value={formula} onChange={setFormula} onErrorsChanged={setErrors} onTokensChanged={setTokens} />
      {errors.map((error, i) => (
        <div key={i} className="error">
          {error.error}
        </div>
      ))}
    </div>
  );
};
```

---

### 5. Evaluation

For evaluating the tokens we're going to have three components:

- Functions
- NodeGenerator
- Evaluator

Our `Functions.js` file has a basic mapping of operators and functions to JavaScript functions. This would need to be expanded and hardened for real world use.

```javascript
const operators = {
  '&': Concatenate,
  '+': Add,
  '-': Subtract,
  '/': Divide,
  '*': Multiply,
};

export function ExecuteOperator(operator, parameters) {
  const method = operators[operator];
  if (method) {
    return method(parameters);
  }
  return '';
}

const functions = {
  upper: Upper,
  round: Round,
};

export function ExecuteFunction(name, parameters) {
  const method = functions[name.toLowerCase()];
  if (method) {
    return method(parameters);
  }
  return '';
}

export function HasFunction(name) {
  return !!functions[name.toLowerCase()];
}

function Concatenate(params) {
  return params.join('');
}

function Add(params) {
  return Number(params[0]) + Number(params[1]);
}

function Subtract(params) {
  return Number(params[0]) - Number(params[1]);
}

function Divide(params) {
  return Number(params[0]) / Number(params[1]);
}

function Multiply(params) {
  return Number(params[0]) * Number(params[1]);
}

function Upper(params) {
  if (params.length > 0) {
    return params[0].toUpperCase();
  }
  return '';
}

function Round(params) {
  if (params.length > 0) {
    return Math.round(params[0]);
  }
  return '';
}
```

The NodeGenerator file loops through each token and turns them into grouped and nested nodes.

Our example formula would result in a set of nodes that looks like this:

```javascript
[
  {
    type: 'operator',
    value: '+',
    innerNodes: [
      {
        type: 'number',
        value: '1',
      },
      {
        type: 'number',
        value: '2',
      },
    ],
  },
];
```

The evaluator will then be able to pass the two inner node values to the `Add()` function defined in our `Functions.js` file.

Here is the The `NodeGenerator.js` file:

```javascript
export function CreateNodesFromTokens(tokens) {
  const nodes = [];
  const nonWhitespaceTokens = tokens.filter(token => token.type !== 'whitespace');

  for (let i = 0; i < nonWhitespaceTokens.length; i++) {
    const token = nonWhitespaceTokens[i];

    if (['start quote', 'end quote'].indexOf(token.type) > -1) {
      continue;
    }

    if (['string', 'number'].indexOf(token.type) > -1) {
      addNode(nodes, {
        type: token.type,
        value: token.value,
      });
    }

    if (token.type === 'operator') {
      const lastNode = nodes[nodes.length - 1];
      nodes.pop();
      nodes.push({
        type: 'operator',
        value: token.value,
        innerNodes: [lastNode],
      });
    }

    if (token.type === 'reference-name') {
      addNode(nodes, {
        type: 'reference',
        value: token.value,
      });
    }

    if (token.type === 'function-name') {
      let innerTokens = [];

      // move forward past the function name
      i++;

      if (nonWhitespaceTokens[i] && nonWhitespaceTokens[i].type === 'bracket' && nonWhitespaceTokens[i].value === '(') {
        const innerTokenResult = getInnerTokens(nonWhitespaceTokens.slice(i));
        innerTokens = innerTokenResult.tokens;
        i += innerTokenResult.i;
      }

      addNode(nodes, {
        type: 'function',
        value: token.value,
        innerNodes: CreateNodesFromTokens(innerTokens),
      });
    }

    if (token.type === 'bracket' && token.value === '(') {
      const innerTokenResult = getInnerTokens(nonWhitespaceTokens.slice(i));
      i += innerTokenResult.i;
      const innerTokens = innerTokenResult.tokens;

      addNode(nodes, {
        type: 'group',
        innerNodes: innerTokens ? CreateNodesFromTokens(innerTokens) : null,
      });
    }
  }
  return nodes;
}

function addNode(nodes, node) {
  const lastNode = nodes[nodes.length - 1];
  if (lastNode && lastNode.type === 'operator' && lastNode.innerNodes.length < 2) {
    lastNode.innerNodes.push(node);
  } else {
    nodes.push(node);
  }
}

function getInnerTokens(tokens) {
  const innerTokens = [];
  const innerBrackets = [];
  let i;
  for (i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'bracket') {
      if (tokens[i].value === ')' && innerBrackets[innerBrackets.length - 1] === '(') {
        innerBrackets.pop();

        if (innerBrackets.length === 0) {
          i++;
          break;
        }
      }
      if (tokens[i].value === '(') {
        innerBrackets.push(tokens[i].value);

        if (i === 0) {
          continue;
        }
      }
    }

    innerTokens.push(tokens[i]);
  }

  return { tokens: innerTokens, i: i - 1 };
}
```

And finally our `Evaluator.js` file which recursively calls itself to handle the nested nodes.

```javascript
import { ExecuteFunction, ExecuteOperator } from './Functions';
import { CreateNodesFromTokens } from './NodeGenerator';

export function EvaluateTokens(tokens, input) {
  const nodes = CreateNodesFromTokens(tokens);
  let result = '';
  for (const node of nodes) {
    result += EvaluateNode(node, input);
  }
  return result;
}

function EvaluateNode(node, input) {
  if (!node) {
    return '';
  }
  if (node.type === 'operator') {
    const parameters = node.innerNodes.map(x => EvaluateNode(x, input));
    return ExecuteOperator(node.value, parameters);
  } else if (node.type === 'function') {
    const parameters = node.innerNodes.map(x => EvaluateNode(x, input));
    return ExecuteFunction(node.value, parameters);
  } else if (node.type === 'reference') {
    return input[node.value] || '';
  } else if (node.type === 'string') {
    return node.value;
  } else if (node.type === 'number') {
    return node.value;
  }
  return '';
}

export function GetReferencesFromTokens(tokens) {
  return tokens
    .filter(x => x.type === 'reference-name')
    .map(x => x.value)
    .filter((v, i, a) => a.indexOf(v) === i); // remove duplicates
}
```

We can now update our code editor to run the formulas and let the user set the values for any references that are in the formula.

I'm using a custom hook named [useForm](https://github.com/aks427/andrewstevens.dev/tree/master/src/pages/posts/formula-parser-in-javascript/example/useForm.js) that I often use for easily populating a key value pair object.

```javascript
import React, { useState } from 'react';
import { FormulaEditor } from './FormulaEditor';
import { EvaluateTokens, GetReferencesFromTokens } from './Evaluator';
import { useForm } from './useForm';

export default () => {
  const [formula, setFormula] = useState(`"Hello " & [First Name] & "! " & Round(1.2 + [Some Number])`);
  const [errors, setErrors] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [inputValues, setInputValue] = useForm({
    'First Name': 'Andrew',
    'Some Number': 3,
  });

  const references = GetReferencesFromTokens(tokens);
  const result = EvaluateTokens(tokens, inputValues);

  return (
    <div>
      <h3>Editor</h3>
      <FormulaEditor value={formula} onChange={setFormula} onErrorsChanged={setErrors} onTokensChanged={setTokens} />
      {errors.map((error, i) => (
        <div key={i} className="error">
          {error.error}
        </div>
      ))}
      {references.length > 0 ? <h3>References</h3> : null}
      {references.map(x => (
        <div key={x} className="input-value">
          <div>{x}</div>
          <input value={inputValues[x] || ''} onChange={e => setInputValue(x, e.target.value)} />
        </div>
      ))}
      <h3>Result</h3>
      <div className="result">{result}</div>
    </div>
  );
};
```

---

- Here is a [Live Example](/posts/formula-parser-in-javascript/example) of it all working end to end
- Try it out on [CodeSandbox](https://codesandbox.io/s/simple-formula-parser-bxin6)

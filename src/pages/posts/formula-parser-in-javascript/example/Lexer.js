import { SyntaxTokenizer } from './SyntaxTokenizer';

export function GetTokensForFormula(formula) {
  let position = 0;

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
    if (consume !== false) {
      position += match[0].length;
    }
    return match[0];
  };
  const next = () => {
    position += 1;
    return peek();
  };

  const tokens = [];

  while (!isEnd()) {
    const startingPosition = position;
    const tokenType = SyntaxTokenizer({ peek, match, next, isEnd }, tokens);

    if (startingPosition === position) {
      throw 'Tokenizer did not move forward';
    }

    const token = {
      value: formula.substring(startingPosition, position),
      type: tokenType,
      start: startingPosition,
      end: position - 1,
    };

    tokens.push(token);
  }

  return tokens;
}

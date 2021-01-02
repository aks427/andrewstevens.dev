import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GetTokensForFormula } from './Lexer';
import { ValidateTokens } from './Validation';
import './FormulaEditor.scss';

export function FormulaEditor(props) {
  const { value, onChange, onErrorsChanged } = props;
  const inputRef = useRef();
  const formattedRef = useRef();
  const [textareaHeight, setTextareaHeight] = useState(30);
  const [tokens, setTokens] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const t = GetTokensForFormula(value);
    const e = ValidateTokens(t);
    setTokens(t);
    setErrors(e);
    if (onErrorsChanged) {
      onErrorsChanged(e);
    }
  }, [value, GetTokensForFormula, ValidateTokens]);

  const onInputScroll = () => {
    formattedRef.current.scrollTop = inputRef.current.scrollTop;
    formattedRef.current.scrollLeft = inputRef.current.scrollLeft;
  };

  useLayoutEffect(() => {
    inputRef.current.addEventListener('scroll', onInputScroll);
    return () => {
      inputRef.current.removeEventListener('scroll', onInputScroll);
    };
  }, [inputRef, onInputScroll]);

  const updateInputHeight = () => {
    inputRef.current.style.height = 'auto';
    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight + 2, 200)}px`;
    setTextareaHeight(inputRef.current.scrollHeight + 2); // add 1px for top and bottom borders
  };

  useLayoutEffect(() => {
    updateInputHeight();
  }, [updateInputHeight, value]);

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

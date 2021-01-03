import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../../../../components/layout';
import { FormulaEditor } from '../../../../examples/formula-parser-in-javascript/FormulaEditor';
import { EvaluateTokens, GetReferencesFromTokens } from '../../../../examples/formula-parser-in-javascript/Evaluator';
import { useForm } from '../../../../examples/formula-parser-in-javascript/useForm';
import './Example.scss';

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
    <Layout>
      <Helmet>
        <title>Parser Example</title>
      </Helmet>
      <div className="formula-example">
        <p>
          This is an example for the <a href="/posts/formula-parser-in-javascript">Write a simple formula parser in JavaScript</a> post.
        </p>
        <p>This shows the editor, validator and evaluator all working together.</p>

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
    </Layout>
  );
};

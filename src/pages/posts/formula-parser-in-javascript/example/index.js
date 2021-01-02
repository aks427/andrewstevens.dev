import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../../../../components/layout';
import { FormulaEditor } from './FormulaEditor';
import './Example.scss';

export default () => {
  const [formula, setFormula] = useState(`"test" & round(1.2) + [name]`);
  const [errors, setErrors] = useState([]);

  return (
    <Layout>
      <Helmet>
        <title>Parser Example</title>
      </Helmet>
      <div className="formula-example">
        <FormulaEditor value={formula} onChange={setFormula} onErrorsChanged={setErrors} />
        {errors.map((error, i) => (
          <div key={i} className="error">
            {error.error}
          </div>
        ))}
      </div>
    </Layout>
  );
};

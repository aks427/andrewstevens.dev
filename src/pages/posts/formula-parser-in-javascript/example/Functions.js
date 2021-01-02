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

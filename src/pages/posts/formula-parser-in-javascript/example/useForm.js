import { useReducer } from 'react';

function reducer(previousState, action) {
  let state = deepClone(previousState);
  state[action.propertyName] = action.value;
  return state;
}

export function useForm(initialState) {
  const [formState, dispatch] = useReducer(reducer, initialState);
  const setValue = (propertyName, value) => {
    dispatch({ propertyName, value });
  };
  return [formState, setValue];
}

function deepClone(obj) {
  if (!obj) {
    return null;
  }
  return JSON.parse(JSON.stringify(obj));
}

export const modifyNestedValue = (state, keyList, value) => {
  const key = keyList.shift();

  if (keyList.length) {
    return {
      ...state,
      [key]: modifyNestedValue(state[key], keyList, value),
    };
  } else {
    return {
      ...state,
      [key]: value,
    };
  }
};

export const modifyNestedValueInList = (state, keyList, index, value) => {
  const key = keyList.shift();

  if (keyList.length) {
    return {
      ...state,
      [key]: modifyNestedValueInList(state[key], keyList, index, value),
    };
  } else {
    let targetArray = [...state[key]];
    targetArray[index] = value;
    return {
      ...state,
      [key]: targetArray,
    };
  }
};

export const deleteNestedValueInList = (state, keyList, index) => {
  const key = keyList.shift();

  if (keyList.length) {
    return {
      ...state,
      [key]: deleteNestedValueInList(state[key], keyList, index),
    };
  } else {
    let targetArray = [...state[key]];
    targetArray.splice(index, 1);
    return {
      ...state,
      [key]: targetArray,
    };
  }
};

export const addNestedValueInList = (state, keyList, value) => {
  const key = keyList.shift();

  if (keyList.length) {
    return {
      ...state,
      [key]: addNestedValueInList(state[key], keyList, value),
    };
  } else {
    let targetArray = [...state[key]];
    targetArray.push(value);
    return {
      ...state,
      [key]: targetArray,
    };
  }
};

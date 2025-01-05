// hasExtraKeys
export const hasExtraKeys = (obj: object, allowedKeys: Array<string>) => {
  const objKeys = Object.keys(obj);

  for (const key of objKeys) {
    if (!allowedKeys.includes(key)) {
      return true; // Found an extra key
    }
  }

  return false; // No extra keys found
};

// isValidJSON
export const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export const serverPayloadValidAndUseful = (
  payload: any,
  validRequestFields: Array<string>,
  reqOptFields: number,
  optFieldsArr: Array<string>
) => {
  const isObj = typeof payload === 'object';
  const objKeyGt0 = Object.keys(payload).length > 0;
  const jsonValid = isValidJSON(JSON.stringify(payload));
  const noExtraKeys = !hasExtraKeys(
    JSON.parse(JSON.stringify(payload)),
    validRequestFields
  );
  const optFieldMinReqMeet = validRequestFields.some(value =>
    optFieldsArr.includes(value)
  );

  return (
    isObj &&
    objKeyGt0 &&
    jsonValid &&
    noExtraKeys &&
    reqOptFields > 0 &&
    optFieldMinReqMeet
  );
};

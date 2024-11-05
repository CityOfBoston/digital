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
  validRequestFields: Array<string>
) => {
  let retBool: boolean = false;

  if (typeof payload === 'object') retBool = true;
  if (Object.keys(payload).length > 0) retBool = true;
  if (isValidJSON(JSON.stringify(payload))) retBool = true;
  if (!hasExtraKeys(JSON.parse(JSON.stringify(payload)), validRequestFields))
    retBool = true;

  return retBool;
};

// export const serverPayloadMinReqOptFields = (payloadObjs: object, reqFields: Array<string>, optFields: Array<string>, optFieldMinNum: number) => {

// };

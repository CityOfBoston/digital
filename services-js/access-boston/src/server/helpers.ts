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

/**
 * Filter through several fields to try and match user input;
 * returns true if input matches any value for the given fields.
 */
export function findMatch(item: any, value: string): any | null {
  const fields = ['givenName', 'sn', 'displayName', 'cn'];
  const inputValue = value.trim().toLowerCase();

  return fields
    .map(field => item[field])
    .some(
      value =>
        value && value.toLowerCase().slice(0, inputValue.length) === inputValue
    );
}

export function getItemObject(list: any[], cn: string): any {
  return list.find(item => item.cn === cn);
}

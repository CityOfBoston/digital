export const isDateObj = (dateObj: Date | null) => {
  return (
    dateObj &&
    Object.prototype.toString.call(dateObj) === '[object Date]' &&
    isNaN(dateObj.getDate()) === false
  );
};

export const formatDate = (dateObj: Date) => {
  return `${dateObj.getMonth() +
    1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
};

export const fixUTCDate = (dateObj: Date) => {
  return new Date(
    +dateObj.getUTCFullYear().toString(),
    +dateObj.getUTCMonth().toString(),
    +dateObj.getUTCDate().toString()
  );
};

export function formatDateTime(
  timestamp: number | string,
  localeCode?: string
) {
  const dateTime = new Date(+timestamp * 1000);
  const locale = localeCode || 'en-US';

  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    timeZoneName: 'short',
  };

  return new Intl.DateTimeFormat(locale, options).format(dateTime);
}

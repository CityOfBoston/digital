interface GoogleAnalyticsEventOptions {
  send_to?: string;
  value?: number;
  event_category?: string;
  event_label?: string;
  description?: string;
  fatal?: boolean;
  [metricName: string]: string | number | boolean | undefined;
}

interface GoogleAnalyticsConfigOptions {
  page_path?: string;
  custom_map?: { [metricIndex: string]: string };
}

declare function gtag(action: 'js', date: Date);
declare function gtag(
  action: 'config',
  property: string,
  options?: GoogleAnalyticsConfigOptions
);
declare function gtag(
  action: 'event',
  eventName: string,
  eventOptions?: GoogleAnalyticsEventOptions
);

/**
 * Calculate how long ago the provided date is compare to now
 * @param date Date or date string
 */
export const getTimeAgo = (date: Date): string => {
  const time = new Date(date).getTime();
  const now = new Date().getTime();
  let diff = Math.round((now - time) / 1000); // seconds
  if (diff < 60) return diff < 10 ? 'Just now' : `${diff}s ago`;

  diff = Math.round(diff / 60); // minutes
  if (diff < 60) return `${diff}m ago`;

  diff = Math.round(diff / 60); // hours
  if (diff < 24) return `${diff}h ago`;

  diff = Math.round(diff / 24); // days
  if (diff < 7) return `${diff} day${diff === 1 ? '' : 's'} ago`;

  diff = Math.round(diff / 7); // weeks
  if (diff < 4) return `${diff} week${diff === 1 ? '' : 's'} ago`;

  diff = Math.round(diff / 4); // months
  return `${diff} month${diff === 1 ? '' : 's'} ago`;
};

export const getDateTimeStr = (d: Date): string => {
  const date = new Date(d);
  const now = new Date();
  const diff = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60)); // hours

  let options: Intl.DateTimeFormatOptions = {};

  if (diff < 24) options = { hour: 'numeric', minute: 'numeric' };
  else if (Math.round(diff / 24) < 7)
    options = {
      hour: 'numeric',
      minute: 'numeric',
      month: 'short',
      day: 'numeric',
    };
  else if (date.getFullYear() === now.getFullYear())
    options = { month: 'short', day: 'numeric' };
  else options = { year: 'numeric', month: 'numeric', day: 'numeric' };

  return date.toLocaleString('en-US', options);
};

/**
 * Display time ago (ex: 10s ago, 2m ago, 3h ago, 5 days ago) when it's less than a week.
 * After that display MMM YY if it's still in the same year, or MM/DD/YY when it's already in the past years.
 */
export const getTimeAgoAndDateStr = (d: Date): string => {
  const date = new Date(d);
  const now = new Date();
  let diff = Math.round((now.getTime() - date.getTime()) / 1000); // seconds
  if (diff < 60) return diff < 10 ? 'Just now' : `${diff}s ago`;

  diff = Math.round(diff / 60); // minutes
  if (diff < 60) return `${diff}m ago`;

  diff = Math.round(diff / 60); // hours
  if (diff < 24) return `${diff}h ago`;

  diff = Math.round(diff / 24); // days
  if (diff < 7) return `${diff} day${diff === 1 ? '' : 's'} ago`;

  let options: Intl.DateTimeFormatOptions = {};

  if (date.getFullYear() === now.getFullYear())
    options = { month: 'short', day: 'numeric' };
  else options = { year: 'numeric', month: 'numeric', day: 'numeric' };

  return date.toLocaleString('en-US', options);
};

/**
 * Calculate how long ago the provided date is compare to now
 * @param date Date or date string
 */
export const getTimeAgo = (date: Date): string => {
  const time = new Date(date).getTime();
  const now = new Date().getTime();
  let diff = Math.round((now - time) / (1000 * 60)); // minutes
  if (diff < 60) return `${diff === 0 ? 1 : diff}m ago`;

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
  else if (date.getFullYear() === now.getFullYear())
    options = { month: 'short', day: 'numeric' };
  else options = { year: 'numeric', month: 'numeric', day: 'numeric' };

  return date.toLocaleString('en-US', options);
};

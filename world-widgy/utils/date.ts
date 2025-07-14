export const getFormattedDate = (date: Date, timezone: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const getDayOffset = (date: Date, localTimezone: string, targetTimezone: string): string => {
  const toISODateStringInTZ = (d: Date, timeZone: string): string => {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(d);
    } catch (e) {
      console.error(`Invalid timezone for date formatting: ${timeZone}`, e);
      return d.toISOString().split('T')[0];
    }
  };

  const localDateStr = toISODateStringInTZ(date, localTimezone);
  const targetDateStr = toISODateStringInTZ(date, targetTimezone);
  
  if (targetDateStr > localDateStr) return 'Tomorrow';
  if (targetDateStr < localDateStr) return 'Yesterday';
  return 'Today';
};

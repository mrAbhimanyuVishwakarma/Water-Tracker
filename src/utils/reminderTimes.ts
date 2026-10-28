export function reminderTimes(wakeTime: string, sleepTime: string, interval: number): { hour: number; minute: number }[] {
  const parse = (time: string) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Use a valid wake and sleep time.');
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  };
  const start = parse(wakeTime);
  const end = parse(sleepTime);
  if (![60, 90, 120].includes(interval)) throw new Error('Choose a reminder interval of 60, 90, or 120 minutes.');
  const duration = (end - start + 1440) % 1440;
  const times = [];
  for (let offset = interval; offset < duration; offset += interval) {
    const minutes = (start + offset) % 1440;
    times.push({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
  }
  return times;
}

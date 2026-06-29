export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function generateTimeOptions(start, end, intervalMinutes) {
  const options: string[] = [];

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const current = new Date();
  current.setHours(startHour, startMinute, 0, 0);

  const last = new Date();
  last.setHours(endHour, endMinute, 0, 0);

  while (current <= last) {
    const hour = String(current.getHours()).padStart(2, "0");
    const minute = String(current.getMinutes()).padStart(2, "0");

    options.push(`${hour}:${minute}`);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return options;
}
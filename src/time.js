export function zonedDateKey(date, timeZone) {
  const parts = dateParts(date, timeZone);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function startOfZonedDay(dateKey, timeZone) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const parts = dateParts(utcGuess, timeZone);
  const desiredMinutes = year * 525600 + month * 43200 + day * 1440;
  const actualMinutes = parts.year * 525600 + parts.month * 43200 + parts.day * 1440 + parts.hour * 60 + parts.minute;
  return new Date(utcGuess.getTime() + (desiredMinutes - actualMinutes) * 60000);
}

export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

export function xmltvTime(date) {
  const yyyy = date.getUTCFullYear();
  const mm = pad2(date.getUTCMonth() + 1);
  const dd = pad2(date.getUTCDate());
  const hh = pad2(date.getUTCHours());
  const min = pad2(date.getUTCMinutes());
  const ss = pad2(date.getUTCSeconds());
  return `${yyyy}${mm}${dd}${hh}${min}${ss} +0000`;
}

export function nextZonedRun(now, timeZone, hour, minute) {
  const today = zonedDateKey(now, timeZone);
  let candidate = addMinutes(startOfZonedDay(today, timeZone), hour * 60 + minute);
  if (candidate <= now) {
    candidate = addMinutes(startOfZonedDay(addDaysKey(today, 1), timeZone), hour * 60 + minute);
  }
  return candidate;
}

function addDaysKey(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`;
}

function dateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const values = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second)
  };
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

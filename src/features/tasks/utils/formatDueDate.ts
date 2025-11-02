const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DATE_TIME_WITH_OPTIONAL_SECONDS =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/;

const pad = (value: number | string) => value.toString().padStart(2, "0");

export function normalizeDueDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const match = trimmed.match(DATE_TIME_WITH_OPTIONAL_SECONDS);

  if (match) {
    const [, datePartYear, datePartMonth, datePartDay, hours, minutes, seconds] = match;

    const normalizedSeconds = seconds ?? "00";

    return `${datePartYear}-${datePartMonth}-${datePartDay}T${hours ?? "00"}:${
      minutes ?? "00"
    }:${normalizedSeconds}`;
  }

  const parsedDate = new Date(trimmed);

  if (Number.isNaN(parsedDate.getTime())) {
    return trimmed;
  }

  const year = parsedDate.getFullYear();
  const month = pad(parsedDate.getMonth() + 1);
  const day = pad(parsedDate.getDate());
  const hours = pad(parsedDate.getHours());
  const minutes = pad(parsedDate.getMinutes());
  const seconds = pad(parsedDate.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function toDueDateInputValue(value?: string): string {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(DATE_TIME_WITH_OPTIONAL_SECONDS);

  if (match) {
    const [, year, month, day, hours, minutes] = match;

    return `${year}-${month}-${day}T${pad(hours ?? "00")}:${pad(minutes ?? "00")}`;
  }

  const parsedDate = new Date(trimmed);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = pad(parsedDate.getMonth() + 1);
  const day = pad(parsedDate.getDate());
  const hours = pad(parsedDate.getHours());
  const minutes = pad(parsedDate.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatDueDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const match = trimmed.match(DATE_TIME_WITH_OPTIONAL_SECONDS);

  if (match) {
    const [, yearStr, monthStr, dayStr, hoursStr, minutesStr, secondsStr] = match;

    const year = Number.parseInt(yearStr, 10);
    const month = Number.parseInt(monthStr, 10);
    const day = Number.parseInt(dayStr, 10);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return trimmed;
    }

    const monthName = MONTHS_EN[month - 1];
    const datePart = `${monthName} ${day}, ${year}`;

    if (hoursStr && minutesStr) {
      const hours = Number.parseInt(hoursStr, 10);
      const minutes = Number.parseInt(minutesStr, 10);
      const seconds = secondsStr ? Number.parseInt(secondsStr, 10) : 0;

      if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes) ||
        Number.isNaN(seconds) ||
        hours > 23 ||
        minutes > 59 ||
        seconds > 59
      ) {
        return `${datePart}`;
      }

      return `${datePart}, ${pad(hours)}:${pad(minutes)}`;
    }

    return datePart;
  }

  const parsedDate = new Date(trimmed);

  if (Number.isNaN(parsedDate.getTime())) {
    return trimmed;
  }

  return parsedDate.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
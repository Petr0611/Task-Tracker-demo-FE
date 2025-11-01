import { useEffect, useState } from "react";

interface DeadlineTimerProps {
  dueDate: string;
}

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;

const formatPart = (value: number, suffix: string) => `${value} ${suffix}`;

const formatRemaining = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / SECONDS_IN_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_IN_DAY) / SECONDS_IN_HOUR);
  const minutes = Math.floor(
    (totalSeconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE,
  );
  const seconds = totalSeconds % SECONDS_IN_MINUTE;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(formatPart(days, "д"));
  }

  if (hours > 0 || days > 0) {
    parts.push(formatPart(hours, "ч"));
  }

  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(formatPart(minutes, "м"));
  }

  parts.push(formatPart(seconds, "с"));

  return parts.join(" ");
};

const getTimerState = (dueDate: string) => {
  const dueTimestamp = new Date(dueDate).getTime();

  if (Number.isNaN(dueTimestamp)) {
    return {
      text: "Не удалось вычислить срок",
      isOverdue: false,
    };
  }

  const diffMs = dueTimestamp - Date.now();

  if (diffMs <= 0) {
    const overdueSeconds = Math.floor(Math.abs(diffMs) / 1000);
    return {
      text:
        overdueSeconds > 0
          ? `Просрочено на ${formatRemaining(overdueSeconds)}`
          : "Дедлайн истёк",
      isOverdue: true,
    };
  }

  const remainingSeconds = Math.floor(diffMs / 1000);

  return {
    text: formatRemaining(remainingSeconds),
    isOverdue: false,
  };
};

export function DeadlineTimer({ dueDate }: DeadlineTimerProps) {
  const [timerState, setTimerState] = useState(() => getTimerState(dueDate));

  useEffect(() => {
    setTimerState(getTimerState(dueDate));

    const intervalId = window.setInterval(() => {
      setTimerState(getTimerState(dueDate));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dueDate]);

  const timerClassName = timerState.isOverdue
    ? "deadline-timer deadline-timer--overdue"
    : "deadline-timer";

  return (
    <p className={timerClassName}>
      <span className="deadline-timer__label">До дедлайна:</span>{" "}
      <span className="deadline-timer__value">{timerState.text}</span>
    </p>
  );
}

export default DeadlineTimer;
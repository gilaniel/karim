// hooks/useNextSleepTime.ts
import { useMemo } from "react";
import { useActivityStore } from "@/entities/activity/store";
import {
  differenceInSeconds,
  addSeconds,
  format,
  isAfter,
  parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";

// Конфигурация интервалов между снами в зависимости от времени дня
const SLEEP_INTERVALS = {
  NIGHT: 180, // 2 часа 40 минут = 180 минут (после ночного сна)
  MORNING: 180, // 2 часа 40 минут = 180 минут (после утреннего)
  AFTERNOON: 180, // 2 часа 40 минут = 160 минут (после обеда)
};

// Функция для определения типа сна по времени начала
const getSleepPeriodType = (
  sleepStartTime: Date,
): "NIGHT" | "MORNING" | "AFTERNOON" => {
  const hours = sleepStartTime.getHours();

  if (hours >= 20) return "NIGHT";
  if (hours >= 6 && hours < 12) return "MORNING";

  return "AFTERNOON";
};

export const useNextSleepTime = () => {
  const { activities } = useActivityStore();

  return useMemo(() => {
    let completedSleeps = activities.filter(
      (activity) => activity.type === "SLEEP",
    );

    if (
      completedSleeps.length === 0 ||
      (!!completedSleeps.length && !completedSleeps[0].endTime)
    ) {
      return {
        nextSleepTime: null,
        timeUntilNextSleep: null,
        formattedTime: "Нет данных",
        message: "Нет завершенных снов",
      };
    }

    completedSleeps = completedSleeps.sort(
      (a, b) => parseISO(b.endTime!).getTime() - parseISO(a.endTime!).getTime(),
    );

    // Берем последний завершенный сон
    const lastSleep = completedSleeps[0];
    const sleepEndTime = parseISO(lastSleep.endTime!);
    const sleepPeriod = getSleepPeriodType(parseISO(lastSleep.startTime));

    // Получаем интервал для этого типа сна
    const intervalMinutes = SLEEP_INTERVALS[sleepPeriod];

    // Рассчитываем время следующего сна
    const nextSleepTime = addSeconds(sleepEndTime, intervalMinutes * 60);

    // Проверяем, не наступило ли уже время следующего сна
    const now = new Date();
    const isOverdue = isAfter(now, nextSleepTime);

    // Рассчитываем оставшееся время
    const timeUntilNextSleep = differenceInSeconds(nextSleepTime, now);

    // Форматируем время следующего сна
    const formattedTime = format(nextSleepTime, "HH:mm", { locale: ru });

    // Создаем сообщение
    let message = "";
    if (isOverdue) {
      message = `Пора спать`;
    } else if (timeUntilNextSleep < 600) {
      // Меньше 10 минут
      message = `Скоро спать (через ${Math.floor(timeUntilNextSleep / 60)} мин)`;
    } else {
      message = `Следующий сон в ${formattedTime}`;
    }

    return {
      lastSleep,
      nextSleepTime,
      timeUntilNextSleep: isOverdue ? null : timeUntilNextSleep,
      formattedTime,
      message,
      intervalMinutes,
      isOverdue,
      sleepPeriod: {
        NIGHT: "ночного",
        MORNING: "утреннего",
        AFTERNOON: "дневного",
        EVENING: "вечернего",
      }[sleepPeriod],
    };
  }, [activities]);
};

// components/NextSleepIndicator.tsx
import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNextSleepTime } from "@/shared/hooks/useNextSleepTime";
import { formatDuration } from "@/shared/lib/utils";
import pushNotifiactionService from "@/entities/push/push-notifiaction.service";

export const NextSleepIndicator = () => {
  const {
    message,
    timeUntilNextSleep,
    isOverdue,
    intervalMinutes,
    formattedTime,
    nextSleepTime: nextSleepTimeDate,
  } = useNextSleepTime();

  // Создаем ref для DOM-элемента с временем
  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Сохраняем интервал в ref, чтобы иметь к нему доступ при очистке
  const intervalRef = useRef<number>(null);
  const notifiedRef = useRef<Set<string>>(new Set());

  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
      console.log(
        "👁️ Видимость страницы:",
        !document.hidden ? "видна" : "скрыта",
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // Функция обновления времени в DOM напрямую
    const updateTimeDisplay = () => {
      if (
        !nextSleepTimeDate ||
        isOverdue ||
        !timeDisplayRef.current ||
        !progressBarRef.current
      ) {
        return;
      }

      const now = new Date();
      const diffSeconds = Math.max(
        0,
        Math.floor((nextSleepTimeDate.getTime() - now.getTime()) / 1000),
      );

      const TEN_MINUTES_IN_SECONDS = 600;

      const isTenMinutesLeft = diffSeconds <= TEN_MINUTES_IN_SECONDS;

      if (isTenMinutesLeft) {
        // Создаем уникальный ключ для этого сна (например, по времени начала)
        const sleepKey = nextSleepTimeDate.toISOString();

        // Если ещё не уведомляли об этом сне
        if (!notifiedRef.current.has(sleepKey) && !isPageVisible) {
          notifiedRef.current.add(sleepKey);

          pushNotifiactionService.simulateNotification({
            title: "😴 Пора готовиться ко сну!",
            body: `Через 10 минут время ложиться спать (в ${formattedTime})`,
            silent: false,
            data: {
              url: "/",
              type: "sleep_reminder",
            },
            tag: `sleep-reminder-${Date.now()}`,
            requireInteraction: true,
          });
          // Отправляем уведомление

          console.log("🔔 Отправлено напоминание о сне");
        }
      }

      // Форматируем время
      const formatted = formatDuration(diffSeconds);

      // Напрямую обновляем текст в DOM
      timeDisplayRef.current.textContent = formatted;

      // Обновляем прогресс-бар
      const totalSeconds = intervalMinutes! * 60;
      const progressPercent = (diffSeconds / totalSeconds) * 100;
      progressBarRef.current.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;

      // Если время вышло - останавливаем интервал
      if (diffSeconds === 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    // Запускаем интервал только если нужно обновление в реальном времени
    if (!isOverdue && nextSleepTimeDate) {
      // Сразу устанавливаем начальное значение
      updateTimeDisplay();

      // Запускаем интервал
      intervalRef.current = setInterval(updateTimeDisplay, 1000);
    }

    // Очистка при размонтировании или изменении зависимостей
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nextSleepTimeDate, isOverdue, intervalMinutes]); // Зависимости только те, что влияют на сам интервал

  const getStatusConfig = () => {
    if (isOverdue) {
      return {
        bgColor: "bg-red-50",
        borderColor: "border-red-100",
        iconColor: "text-red-500",
        Icon: AlertCircle,
        textColor: "text-red-700",
      };
    }
    if (timeUntilNextSleep && timeUntilNextSleep < 600) {
      return {
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-100",
        iconColor: "text-yellow-500",
        Icon: AlertCircle,
        textColor: "text-yellow-700",
      };
    }
    return {
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      iconColor: "text-indigo-500",
      Icon: CheckCircle2,
      textColor: "text-indigo-700",
    };
  };

  const config = getStatusConfig();
  const Icon = config.Icon;

  if (!message || message === "Нет завершенных снов") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100"
      >
        <div className="flex items-center gap-3 text-gray-400">
          <Moon className="w-5 h-5" />
          <span className="text-sm">Нет данных для расчета следующего сна</span>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`${config.bgColor} rounded-2xl p-4 mb-4 border ${config.borderColor}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-white ${config.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className={`font-medium ${config.textColor}`}>{message}</p>
              <p className="text-xs text-gray-500 mt-1">
                Время бодрствования {Math.floor(intervalMinutes! / 60)} ч{" "}
                {intervalMinutes! % 60} мин
              </p>
            </div>
          </div>

          {!isOverdue && (
            <div className="text-right">
              <div
                ref={timeDisplayRef}
                className="text-lg font-bold text-indigo-600 font-mono"
              >
                {formatDuration(timeUntilNextSleep || 0)}
              </div>
              <div className="text-xs text-gray-400">до {formattedTime}</div>
            </div>
          )}

          {isOverdue && (
            <div className="text-right">
              <div className="text-xs text-red-600">{formattedTime}</div>
            </div>
          )}
        </div>

        {!isOverdue && (
          <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-indigo-400 rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${Math.max(0, Math.min(100, ((timeUntilNextSleep || 0) / (intervalMinutes! * 60)) * 100))}%`,
              }}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

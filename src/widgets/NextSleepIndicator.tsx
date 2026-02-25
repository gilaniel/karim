// components/NextSleepIndicator.tsx
import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useNextSleepTime } from "@/shared/hooks/useNextSleepTime";
import { formatDuration } from "@/shared/lib/utils";

export const NextSleepIndicator = () => {
  const {
    message,
    timeUntilNextSleep,
    isOverdue,
    intervalMinutes,
    formattedTime,
    nextSleepTime: nextSleepTimeDate,
  } = useNextSleepTime();

  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const intervalRef = useRef<number>(null);

  useEffect(() => {
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

      const formatted = formatDuration(diffSeconds);

      timeDisplayRef.current.textContent = formatted;

      const totalSeconds = intervalMinutes! * 60;
      const progressPercent = (diffSeconds / totalSeconds) * 100;
      progressBarRef.current.style.width = `${Math.max(0, Math.min(100, progressPercent))}%`;

      if (diffSeconds === 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    if (!isOverdue && nextSleepTimeDate) {
      updateTimeDisplay();

      intervalRef.current = setInterval(updateTimeDisplay, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nextSleepTimeDate, isOverdue, intervalMinutes]);

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
    return null;
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

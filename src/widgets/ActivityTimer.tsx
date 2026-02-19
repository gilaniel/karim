import { useEffect, useState } from "react";
import { useActivityStore } from "@/entities/activity/store";
import { ACTIVITY_CONFIG } from "@/entities/activity/model";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { differenceInSeconds, format } from "date-fns";
import { StopCircle } from "lucide-react";
import { ru } from "date-fns/locale";
import { motion } from "framer-motion";

export const ActivityTimer = () => {
  const { activeActivity, stopActivity } = useActivityStore();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(0);

    if (!activeActivity) return;

    const interval = setInterval(() => {
      setSeconds(
        differenceInSeconds(new Date(), new Date(activeActivity.startTime)),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeActivity]);

  if (!activeActivity) return null;

  const config = ACTIVITY_CONFIG[activeActivity.type];

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 5 }}>
      <Card className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 flex items-center justify-between flex-row mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.color} bg-opacity-20`}>
            <config.icon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{config.label}</h2>
            <p className="text-xs text-muted-foreground ">
              Начало в{" "}
              {format(new Date(activeActivity.startTime), "HH:mm", {
                locale: ru,
              })}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono font-bold tabular-nums mb-2">
            {formatTime(seconds)}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-red-500"
            onClick={() => {
              stopActivity();
            }}
          >
            <StopCircle className="mr-2 h-4 w-4" /> Завершить
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

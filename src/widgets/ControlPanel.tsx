import { useState } from "react";
import { useActivityStore } from "@/entities/activity/store";
import { ACTIVITY_CONFIG, type ActivityType } from "@/entities/activity/model";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { motion } from "framer-motion";

export const ControlPanel = () => {
  const { startActivity, stopActivity, activeActivity, addFeeding } =
    useActivityStore();
  const [isFeedingOpen, setFeedingOpen] = useState(false);
  const [volume, setVolume] = useState("150");
  const [time, setTime] = useState("");

  const handleClick = (type: ActivityType) => {
    const isActive = activeActivity?.type === type;

    if (type === "FEEDING") {
      setTime(new Date().toTimeString().slice(0, 5)); // HH:MM
      setFeedingOpen(true);
    } else {
      if (isActive) {
        stopActivity();
        return;
      }

      startActivity(type);
    }
  };

  const saveFeeding = () => {
    addFeeding(Number(volume), time);
    setFeedingOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 gap-3 mb-8"
      >
        {(Object.keys(ACTIVITY_CONFIG) as ActivityType[]).map((type) => {
          const conf = ACTIVITY_CONFIG[type];
          const isActive = activeActivity?.type === type;

          return (
            <Button
              key={type}
              variant="outline"
              className={`relative overflow-hidden rounded-2xl p-4 h-32 w-full flex flex-col items-center justify-center gap-2 shadow-sm border transition-all active:scale-95 
                  ${isActive ? `${conf.color} border-transparent` : "bg-white border-gray-100 hover:border-gray-200"}
                `}
              onClick={() => {
                handleClick(type);
              }}
              disabled={!!activeActivity && !isActive && type !== "FEEDING"}
            >
              <div className={`${conf.color} p-2 rounded-full`}>
                <conf.icon className="size-6" />
              </div>
              <span className="font-semibold">{conf.label}</span>
            </Button>
          );
        })}
      </motion.div>

      <Dialog open={isFeedingOpen} onOpenChange={setFeedingOpen}>
        <DialogContent className="sm:max-w-106.25 font-google-sans">
          <DialogHeader>
            <DialogTitle>Запись кормления</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Время</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Объем (мл)</Label>
              <Input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveFeeding}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

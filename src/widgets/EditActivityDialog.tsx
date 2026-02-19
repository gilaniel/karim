import { useEffect, useState } from "react";
import { type Activity } from "@/entities/activity/model";
import { useActivityStore } from "@/entities/activity/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { format } from "date-fns";

interface Props {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditActivityDialog = ({ activity, open, onOpenChange }: Props) => {
  const { updateActivity } = useActivityStore();

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [volume, setVolume] = useState("");

  useEffect(() => {
    if (activity) {
      setStart(format(new Date(activity.startTime), "yyyy-MM-dd'T'HH:mm"));
      setEnd(
        activity.endTime
          ? format(new Date(activity.endTime), "yyyy-MM-dd'T'HH:mm")
          : "",
      );
      setVolume(activity.volumeMl ? String(activity.volumeMl) : "");
    }
  }, [activity]);

  const handleSave = async () => {
    if (!activity) return;

    const payload: Partial<Activity> = {
      startTime: new Date(start).toISOString(),
    };

    if (end) {
      payload.endTime = new Date(end).toISOString();
    }

    if (activity.type === "FEEDING") {
      payload.endTime = payload.startTime;
      payload.volumeMl = Number(volume);
    }

    await updateActivity(activity.id, payload);
    onOpenChange(false);
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 font-google-sans">
        <DialogHeader>
          <DialogTitle>Редактирование записи</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Начало</Label>
            <Input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          {activity.type !== "FEEDING" && (
            <div className="grid gap-2">
              <Label>Конец {activity.endTime ? "" : "(еще идет)"}</Label>
              <Input
                type="datetime-local"
                value={end}
                disabled={!activity.endTime}
                onChange={(e) => setEnd(e.target.value)}
              />
              {!activity.endTime && (
                <p className="text-xs text-muted-foreground">
                  Остановите таймер, чтобы установить время конца.
                </p>
              )}
            </div>
          )}

          {activity.type === "FEEDING" && (
            <div className="grid gap-2">
              <Label>Объем (мл)</Label>
              <Input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>Сохранить изменения</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

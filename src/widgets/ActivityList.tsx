import { useActivityStore } from "@/entities/activity/store";
import { ACTIVITY_CONFIG, type Activity } from "@/entities/activity/model";
import { differenceInSeconds, format } from "date-fns";
import { Clock, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ru } from "date-fns/locale";
import { useMemo, useState } from "react";
import { EditActivityDialog } from "./EditActivityDialog";

const formatDate = (isoString: string) => {
  return format(new Date(isoString), "d MMMM yyyy", { locale: ru });
};

const calculateDuration = (start: string, end?: string | null) => {
  const endDate = end ? new Date(end) : new Date();
  const startDate = new Date(start);
  return differenceInSeconds(endDate, startDate);
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

export const ActivityList = () => {
  const { activities, deleteActivity } = useActivityStore();

  const [editingItem, setEditingItem] = useState<Activity | null>(null);

  const historyActivities = activities.filter((a) => !!a.endTime);

  const groupedHistoryMap = useMemo(
    () =>
      historyActivities.reduce(
        (groups, activity) => {
          const date = formatDate(activity.startTime);
          if (!groups[date]) groups[date] = [];
          groups[date].push(activity);
          return groups;
        },
        {} as Record<string, Activity[]>,
      ),
    [historyActivities],
  );

  const historyGroups = Object.entries(groupedHistoryMap).map(
    ([date, items]) => ({
      date,
      items: items as Activity[],
    }),
  );

  if (!activities.length)
    return <div className="text-center text-gray-400 mt-10">Нет записей</div>;

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-4">История</h3>
        {historyGroups.map(({ date, items }) => (
          <div key={date} className="space-y-2">
            <div className="sticky top-16 bg-gray-50/95 backdrop-blur-sm py-2 z-0">
              <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">
                {date}
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {items.map((item) => {
                const conf = ACTIVITY_CONFIG[item.type];
                const start = format(new Date(item.startTime), "HH:mm");
                const end = item.endTime
                  ? format(new Date(item.endTime), "HH:mm")
                  : "...";

                const duration = item.endTime
                  ? calculateDuration(item.startTime, item.endTime)
                  : 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 flex items-start justify-between gap-3 group hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${conf.color}`}>
                        <conf.icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-sm">{conf.label}</p>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <p className="text-xs text-gray-500">
                            {start} {item.type !== "FEEDING" && `- ${end}`}
                          </p>
                        </div>
                        {item.type !== "FEEDING" && item.endTime && (
                          <div className="text-xs text-gray-400">
                            Длительность: {formatDuration(duration)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.volumeMl && (
                        <span className="text-sm font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                          {item.volumeMl} мл
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                        onClick={() => deleteActivity(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <EditActivityDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        activity={editingItem}
      />
    </>
  );
};

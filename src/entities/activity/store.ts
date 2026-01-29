import { create } from "zustand";
import type { Activity, ActivityType } from "./model";
import { api } from "@/shared/api/api";
import { toast } from "sonner";

interface Store {
  activities: Activity[];
  activeActivity: Activity | null; // Текущий запущенный таймер
  isLoading: boolean;

  loadInitial: () => Promise<void>;
  startActivity: (type: ActivityType) => Promise<void>;
  stopActivity: () => Promise<void>;
  addFeeding: (volume: number, time: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  updateActivity: (id: string, data: Partial<Activity>) => Promise<void>;
}

export const useActivityStore = create<Store>((set, get) => ({
  activities: [],
  activeActivity: null,
  isLoading: false,

  loadInitial: async () => {
    set({ isLoading: true });
    try {
      const data = await api.getAll();
      // Ищем, есть ли незавершенная активность
      const active =
        data.find((a) => !a.endTime && a.type !== "FEEDING") || null;
      set({ activities: data, activeActivity: active });
    } finally {
      set({ isLoading: false });
    }
  },

  startActivity: async (type) => {
    const { activeActivity, activities } = get();
    // Если уже что-то идет — останавливаем
    if (activeActivity) {
      await get().stopActivity();
    }

    const newItem = await api.create({
      type,
      startTime: new Date().toISOString(),
    });

    set({
      activeActivity: newItem,
      activities: [newItem, ...activities],
    });
  },

  stopActivity: async () => {
    const { activeActivity, activities } = get();
    if (!activeActivity) return;

    const updated = await api.update(activeActivity.id, {
      endTime: new Date().toISOString(),
    });

    set({
      activeActivity: null,
      activities: activities.map((a) => (a.id === updated.id ? updated : a)),
    });
  },

  addFeeding: async (volume, timeStr) => {
    const date = new Date();
    const [hours, mins] = timeStr.split(":").map(Number);
    date.setHours(hours, mins, 0, 0);

    const newItem = await api.create({
      type: "FEEDING",
      startTime: date.toISOString(),
      endTime: date.toISOString(), // Для кормления начало = конец
      volumeMl: volume,
    });

    set((state) => ({ activities: [newItem, ...state.activities] }));
  },

  deleteActivity: async (id) => {
    await api.delete(id);
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
      activeActivity:
        state.activeActivity?.id === id ? null : state.activeActivity,
    }));
  },

  updateActivity: async (id, patch) => {
    const updated = await api.update(id, patch);

    toast.success("Запись обновлена");

    set((state) => {
      const newActivities = state.activities.map((a) =>
        a.id === id ? updated : a,
      );

      newActivities.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );

      return {
        activities: newActivities,
        activeActivity:
          state.activeActivity?.id === id ? updated : state.activeActivity,
      };
    });
  },
}));

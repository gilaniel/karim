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

      set({ activities: data });
    } finally {
      set({ isLoading: false });
    }
  },

  startActivity: async (type) => {
    const { activeActivity, activities } = get();
    if (activeActivity) {
      await get().stopActivity();
    }

    const newItem = await api.create({
      type,
      startTime: new Date().toISOString(),
    });

    set({
      activeActivity: newItem,
    });
  },

  stopActivity: async () => {
    const { activeActivity } = get();
    if (!activeActivity) return;

    await api.update(activeActivity.id, {
      endTime: new Date().toISOString(),
    });

    await get().loadInitial();

    set({
      activeActivity: null,
    });
  },

  addFeeding: async (volume, timeStr) => {
    const date = new Date();
    const [hours, mins] = timeStr.split(":").map(Number);
    date.setHours(hours, mins, 0, 0);

    await api.create({
      type: "FEEDING",
      startTime: date.toISOString(),
      endTime: date.toISOString(), // Для кормления начало = конец
      volumeMl: volume,
    });

    await get().loadInitial();
  },

  deleteActivity: async (id) => {
    await api.delete(id);
    await get().loadInitial();
  },

  updateActivity: async (id, patch) => {
    await api.update(id, patch);

    toast.success("Запись обновлена");

    await get().loadInitial();
  },
}));

import type { Activity } from "@/entities/activity/model";
import axios from "axios";

// Настройка axios (пригодится для реального бэка)
export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // Твой будущий бэкенд
});

// --- FAKE BACKEND (Чтобы работало прямо сейчас) ---
const LOCAL_KEY = "baby-tracker-data";
// const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getLocal = (): Activity[] =>
  JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
const setLocal = (data: Activity[]) =>
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));

export const api = {
  // Получить все записи
  getAll: async (): Promise<Activity[]> => {
    return getLocal().sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  },

  // Создать запись
  create: async (item: Omit<Activity, "id">): Promise<Activity> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    const data = getLocal();
    setLocal([newItem, ...data]);
    return newItem;
  },

  // Обновить запись (например, завершить таймер)
  update: async (id: string, patch: Partial<Activity>): Promise<Activity> => {
    const data = getLocal();
    const index = data.findIndex((i) => i.id === id);
    if (index === -1) throw new Error("Not found");

    const updated = { ...data[index], ...patch };
    data[index] = updated;
    setLocal(data);
    return updated;
  },

  // Удалить
  delete: async (id: string) => {
    const data = getLocal().filter((i) => i.id !== id);
    setLocal(data);
  },
};

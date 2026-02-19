import type { Activity } from "@/entities/activity/model";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // Твой будущий бэкенд
});

const LOCAL_KEY = "baby-tracker-data";

export const api = {
  getAll: async (): Promise<Activity[]> => {
    const { data } = await apiClient.get<Activity[]>("/activities");

    return data.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  },

  create: async (item: Omit<Activity, "id">): Promise<Activity> => {
    const { data } = await apiClient.post<Activity>("/activities", item);

    return data;
  },

  update: async (id: string, patch: Partial<Activity>): Promise<Activity> => {
    const { data } = await apiClient.put<Activity>(`/activities/${id}`, patch);

    return data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/activities/${id}`);
  },

  getActive: async (): Promise<Activity | null> => {
    const { data } = await apiClient.get<Activity | null>("/activities/active");
    return data;
  },

  stopActive: async (): Promise<Activity | null> => {
    const { data } = await apiClient.post<Activity | null>(
      "/activities/stop-active",
    );
    return data;
  },

  getStatistics: async (date: string): Promise<any> => {
    const { data } = await apiClient.get(`/activities/statistics?date=${date}`);
    return data;
  },
};

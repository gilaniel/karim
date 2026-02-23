import { useState, useEffect, useCallback } from "react";
import pushService from "@/entities/push/push-notifiaction.service";
import type { PushNotificationState } from "@/entities/push/model";

export const usePushNotifications = (userId?: string) => {
  const [state, setState] = useState<PushNotificationState>({
    permission: "default",
    isSubscribed: false,
    subscription: null,
    loading: true,
    error: null,
  });

  // Проверка поддержки
  const isSupported = useCallback(() => {
    return "serviceWorker" in navigator && "PushManager" in window;
  }, []);

  // Инициализация
  useEffect(() => {
    const initialize = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        if (!isSupported()) {
          throw new Error(
            "Push notifications are not supported in this browser",
          );
        }

        // Инициализируем сервис
        const initialized = await pushService.init();

        if (!initialized) {
          throw new Error("Failed to initialize push service");
        }

        // Получаем текущий статус
        const permission = pushService.getPermissionState();
        const subscription = await pushService.getSubscription();

        setState({
          permission,
          isSubscribed: !!subscription,
          subscription,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    };

    initialize();
  }, [isSupported]);

  // Запрос разрешения и подписка
  const subscribe = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Запрашиваем разрешение
      const permission = await pushService.requestPermission();

      if (permission !== "granted") {
        throw new Error("Permission denied");
      }

      // Подписываемся
      const subscription = await pushService.subscribe(userId);

      setState({
        permission: "granted",
        isSubscribed: true,
        subscription,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to subscribe",
      }));
      return false;
    }
  }, [userId]);

  // Отписка
  const unsubscribe = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const success = await pushService.unsubscribe();

      if (success) {
        setState({
          permission: state.permission,
          isSubscribed: false,
          subscription: null,
          loading: false,
          error: null,
        });
      }

      return success;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to unsubscribe",
      }));
      return false;
    }
  }, [state.permission]);

  // Симуляция уведомления (для тестов)
  const simulateNotification = useCallback(async (payload: any) => {
    try {
      await pushService.simulateNotification(payload);
    } catch (error) {
      console.error("Failed to simulate notification:", error);
    }
  }, []);

  return {
    ...state,
    isSupported: isSupported(),
    subscribe,
    unsubscribe,
    simulateNotification,
  };
};

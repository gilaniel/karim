import { useEffect } from "react";
import { usePushNotifications } from "./usePushNotifications";

export const useAutoSubscribe = (userId?: string) => {
  const { permission, isSubscribed, loading, subscribe, isSupported } =
    usePushNotifications(userId);

  useEffect(() => {
    const autoSubscribe = async () => {
      // Проверяем поддержку
      if (!isSupported) {
        console.log("Push notifications not supported");
        return;
      }

      // Если уже подписан - ничего не делаем
      if (isSubscribed) {
        console.log("Already subscribed");
        return;
      }

      // Если уже грузится - ждем
      if (loading) {
        console.log("Still loading...");
        return;
      }

      // Если разрешение уже дано, но подписки нет - подписываемся
      if (permission === "granted") {
        console.log("Auto-subscribing...");
        await subscribe();
        return;
      }

      // Если разрешение ещё не запрашивали - запрашиваем
      if (permission === "default") {
        console.log("Requesting permission...");
        const granted = await subscribe();
        if (granted) {
          console.log("Auto-subscribe successful");
        }
      }

      // Если permission === 'denied' - ничего не делаем
    };

    autoSubscribe();
  }, [isSupported, isSubscribed, permission, loading, subscribe, userId]);
};

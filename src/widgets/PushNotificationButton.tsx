// src/components/PushNotificationButton.tsx
import React from "react";
import { usePushNotifications } from "@/shared/hooks/usePushNotifications";
import { Bell, BellOff, Loader } from "lucide-react";

interface PushNotificationButtonProps {
  userId?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PushNotificationButton: React.FC<PushNotificationButtonProps> = ({
  userId,
  className = "",
  onSuccess,
  onError,
}) => {
  const {
    permission,
    isSubscribed,
    loading,
    error,
    isSupported,
    subscribe,
    unsubscribe,
  } = usePushNotifications(userId);

  const handleClick = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        onSuccess?.();
      } else {
        const success = await subscribe();
        if (success) {
          onSuccess?.();
        }
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Unknown error");
    }
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed ${className}`}
        title="Push-уведомления не поддерживаются в вашем браузере"
      >
        <BellOff size={20} />
        <span>Не поддерживается</span>
      </button>
    );
  }

  if (permission === "denied") {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-500 rounded-lg cursor-not-allowed ${className}`}
        title="Разрешение на уведомления отклонено. Измените настройки браузера."
      >
        <BellOff size={20} />
        <span>Уведомления заблокированы</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isSubscribed
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-indigo-500 hover:bg-indigo-600 text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader size={20} className="animate-spin" />
            <span>Загрузка...</span>
          </>
        ) : isSubscribed ? (
          <>
            <BellOff size={20} />
            <span>Отписаться от уведомлений</span>
          </>
        ) : (
          <>
            <Bell size={20} />
            <span>Включить уведомления</span>
          </>
        )}
      </button>

      {error && <p className="text-sm text-red-500">Ошибка: {error}</p>}
    </div>
  );
};

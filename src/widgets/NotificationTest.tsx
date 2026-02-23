// src/components/NotificationTester.tsx
import React, { useState } from "react";
import { PushNotificationButton } from "./PushNotificationButton";
import { usePushNotifications } from "@/shared/hooks/usePushNotifications";

export const NotificationTester: React.FC = () => {
  const [title, setTitle] = useState("Тестовое уведомление");
  const [body, setBody] = useState("Привет из PWA!");
  const { simulateNotification, isSubscribed } = usePushNotifications();

  const handleSendTest = async () => {
    await simulateNotification({
      title,
      body,
      icon: "/web-app-manifest-192x192.png",
      badge: "/favicon-96x96.png",
      vibrate: [200, 100, 200],
      data: {
        url: "/",
        timestamp: Date.now(),
      },
      actions: [
        {
          action: "open",
          title: "Открыть",
        },
        {
          action: "close",
          title: "Закрыть",
        },
      ],
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Push-уведомления</h2>

      <div className="mb-4">
        <PushNotificationButton userId="user123" />
      </div>

      {isSubscribed && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Тестирование</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Заголовок
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Текст</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>

            <button
              onClick={handleSendTest}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Отправить тестовое уведомление
            </button>
          </div>
        </div>
      )}

      {!isSubscribed && (
        <p className="text-sm text-gray-500 mt-4">
          Включите уведомления, чтобы получать обновления
        </p>
      )}
    </div>
  );
};

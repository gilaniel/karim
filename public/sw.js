// public/sw.js
const CACHE_NAME = "pwa-push-v1";

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  self.skipWaiting(); // Активируем сразу
});

// Активация
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(clients.claim()); // Берем контроль над страницей
});

// Обработка push-уведомлений
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  if (!event.data) {
    console.log("[SW] Push received but no data");
    return;
  }

  try {
    // Пытаемся распарсить данные
    let data = event.data.json();

    // Базовая структура уведомления
    const options = {
      body: data.body || "Новое уведомление",
      icon: data.icon || "/icon-192.png",
      badge: data.badge || "/badge-72.png",
      image: data.image,
      vibrate: data.vibrate || [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [],
      tag: data.tag,
      renotify: data.renotify || false,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      timestamp: data.timestamp || Date.now(),
      dir: data.dir || "auto",
      lang: data.lang,
    };

    // Показываем уведомление
    event.waitUntil(
      self.registration.showNotification(data.title || "Уведомление", options),
    );
  } catch (error) {
    console.error("[SW] Error parsing push data:", error);

    // Если данные не JSON, показываем как текст
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification("Новое уведомление", {
        body: text,
        icon: "/icon-192.png",
      }),
    );
  }
});

// Обработка клика по уведомлению
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click:", event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  // Определяем URL для перехода
  let url = "/";

  if (action && data.actions && data.actions[action]) {
    url = data.actions[action].url || data.url || "/";
  } else if (data.url) {
    url = data.url;
  }

  // Открываем или фокусируем окно
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Ищем уже открытое окно
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Открываем новое окно
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});

// Обработка закрытия уведомления
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event);
  // Можно отправить аналитику о закрытии
});

// Обработка фоновой синхронизации (опционально)
self.addEventListener("sync", (event) => {
  console.log("[SW] Sync event:", event);

  if (event.tag === "sync-notifications") {
    event.waitUntil(
      // Здесь можно синхронизировать данные
      Promise.resolve(),
    );
  }
});

// Кэширование ресурсов (опционально)
self.addEventListener("fetch", (event) => {
  // Для простоты не кэшируем, только уведомления
  return;
});

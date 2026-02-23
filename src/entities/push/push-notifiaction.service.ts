import type {
  PushSubscriptionData,
  PermissionState,
  NotificationPayload,
} from "./model";

class PushNotificationService {
  private static instance: PushNotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private applicationServerKey: string | null = null;
  private apiUrl: string;

  private constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Инициализация Service Worker
   */
  async init(): Promise<boolean> {
    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker not supported");
      }

      if (!("PushManager" in window)) {
        throw new Error("Push notifications not supported");
      }

      // Регистрируем Service Worker
      this.swRegistration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        type: "classic",
      });

      console.log(
        "[PushService] Service Worker registered:",
        this.swRegistration,
      );

      // Ждем активации
      await navigator.serviceWorker.ready;

      // Получаем VAPID ключ с сервера
      await this.fetchVapidKey();

      return true;
    } catch (error) {
      console.error("[PushService] Init failed:", error);
      return false;
    }
  }

  /**
   * Получение VAPID ключа с сервера
   */
  private async fetchVapidKey(): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/push/vapid-public-key`);
      const data = await response.json();
      this.applicationServerKey = data.publicKey;
    } catch (error) {
      console.error("[PushService] Failed to fetch VAPID key:", error);
      throw error;
    }
  }

  /**
   * Запрос разрешения на уведомления
   */
  async requestPermission(): Promise<PermissionState> {
    try {
      const permission = await Notification.requestPermission();
      return permission as PermissionState;
    } catch (error) {
      console.error("[PushService] Permission request failed:", error);
      return "denied";
    }
  }

  /**
   * Получение текущего статуса разрешения
   */
  getPermissionState(): PermissionState {
    if (!("Notification" in window)) {
      return "denied";
    }
    return Notification.permission as PermissionState;
  }

  /**
   * Подписка на уведомления
   */
  async subscribe(userId?: string): Promise<PushSubscription | null> {
    try {
      if (!this.swRegistration) {
        throw new Error("Service Worker not registered");
      }

      if (!this.applicationServerKey) {
        await this.fetchVapidKey();
      }

      // Конвертируем ключ в нужный формат
      const convertedKey = this.urlBase64ToUint8Array(
        this.applicationServerKey!,
      );

      // Подписываемся
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as BufferSource,
      });

      console.log("[PushService] Subscribed:", subscription);

      // Отправляем подписку на сервер
      await this.sendSubscriptionToServer(subscription, userId);

      return subscription;
    } catch (error) {
      console.error("[PushService] Subscribe failed:", error);
      throw error;
    }
  }

  /**
   * Отписка от уведомлений
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.swRegistration) {
        return false;
      }

      const subscription =
        await this.swRegistration.pushManager.getSubscription();

      if (subscription) {
        // Уведомляем сервер
        await this.removeSubscriptionFromServer(subscription);

        // Отписываемся
        await subscription.unsubscribe();

        console.log("[PushService] Unsubscribed");
      }

      return true;
    } catch (error) {
      console.error("[PushService] Unsubscribe failed:", error);
      return false;
    }
  }

  /**
   * Проверка статуса подписки
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      return null;
    }
    return this.swRegistration.pushManager.getSubscription();
  }

  /**
   * Отправка подписки на сервер
   */
  private async sendSubscriptionToServer(
    subscription: PushSubscription,
    userId?: string,
  ): Promise<void> {
    const subscriptionData = subscription.toJSON() as PushSubscriptionData;

    try {
      const response = await fetch(`${this.apiUrl}/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscriptionData,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Если подписка уже существует, но это не ошибка
        if (response.status === 409) {
          console.log("[PushService] Subscription already exists");
          return;
        }
        throw new Error(
          data.message || "Failed to send subscription to server",
        );
      }
    } catch (error) {
      console.error("[PushService] Server subscription failed:", error);
      throw error;
    }
  }

  /**
   * Удаление подписки с сервера
   */
  private async removeSubscriptionFromServer(
    subscription: PushSubscription,
  ): Promise<void> {
    const subscriptionData = subscription.toJSON() as PushSubscriptionData;

    await fetch(`${this.apiUrl}/push/unsubscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subscriptionData.endpoint,
      }),
    });
  }

  /**
   * Конвертация base64 ключа в Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray; // Uint8Array совместим с BufferSource
  }

  async sendToUser(
    payload: NotificationPayload,
    userId: string = "user123",
  ): Promise<void> {
    await fetch(`${this.apiUrl}/push/send/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title || "Новое уведомление",
        body: payload.body,
        icon: payload.icon || "/web-app-manifest-192x192.png",
        badge: payload.badge || "/favicon-96x96.png",
        data: payload.data || {},
      }),
    });
  }
  /**
   * Симуляция получения уведомления (для тестов)
   */
  async simulateNotification(payload: NotificationPayload): Promise<void> {
    if (!this.swRegistration) {
      throw new Error("Service Worker not registered");
    }

    await this.swRegistration.showNotification(
      payload.title || "Тестовое уведомление",
      {
        body: payload.body,
        icon: payload.icon || "/icon-192.png",
        badge: payload.badge || "/badge-72.png",
        data: payload.data || {},
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        silent: payload.silent,
      },
    );
  }
}

export default PushNotificationService.getInstance();

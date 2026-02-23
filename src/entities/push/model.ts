// src/types/push.types.ts
export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys?: PushSubscriptionKeys;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  vibrate?: number[];
  data?: Record<string, any>;
  actions?: NotificationAction[];
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationOptions extends NotificationPayload {
  dir?: "auto" | "ltr" | "rtl";
  lang?: string;
  sound?: string;
}

export interface ServerSubscriptionData {
  subscription: PushSubscriptionData;
  userId?: string;
}

// Тип для состояния
export type PermissionState = NotificationPermission; // Используем встроенный тип

export interface PushNotificationState {
  permission: NotificationPermission;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  loading: boolean;
  error: string | null;
}

import { useEffect } from "react";
import { useActivityStore } from "@/entities/activity/store";
import { ActivityTimer } from "@/widgets/ActivityTimer";
import { ControlPanel } from "@/widgets/ControlPanel";
import { ActivityList } from "@/widgets/ActivityList";
import { Toaster } from "./shared/ui/sonner";
import { motion } from "framer-motion";
import { NextSleepIndicator } from "./widgets/NextSleepIndicator";
import { useAutoSubscribe } from "./shared/hooks/useSubscribe";
import "@/styles/global.css";

function App() {
  const { loadInitial } = useActivityStore();

  useEffect(() => {
    loadInitial();
  }, []);

  useAutoSubscribe("user123");

  return (
    <>
      <Toaster />

      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white shadow-sm sticky top-0 z-10"
      >
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-rose-100  rounded-full overflow-hidden size-10">
              <img src="/kk.webp" className="object-cover object-center" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Karim daily</h1>
          </div>
        </div>
      </motion.header>

      <div className="h-full bg-gray-50 p-4 text-gray-900 font-google-sans">
        <div className="max-w-md mx-auto">
          <main>
            <ControlPanel />

            <ActivityTimer />

            <NextSleepIndicator />

            <ActivityList />
          </main>
        </div>
      </div>

      {/* <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            PWA Push Notifications Demo
          </h1>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Базовая подписка</h2>
              <PushNotificationButton userId="user123" />
            </div>

            <NotificationTester />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                Как это работает?
              </h3>
              <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                <li>Нажмите "Включить уведомления"</li>
                <li>Разрешите уведомления в браузере</li>
                <li>Отправьте тестовое уведомление</li>
                <li>Уведомление появится даже когда приложение закрыто!</li>
              </ul>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}

export default App;

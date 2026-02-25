import { useEffect, useState } from "react";
import { useActivityStore } from "@/entities/activity/store";
import { ActivityTimer } from "@/widgets/ActivityTimer";
import { ControlPanel } from "@/widgets/ControlPanel";
import { ActivityList } from "@/widgets/ActivityList";
import { Toaster } from "./shared/ui/sonner";
import { motion } from "framer-motion";
import { NextSleepIndicator } from "./widgets/NextSleepIndicator";
import "@/styles/global.css";

function App() {
  const { loadInitial } = useActivityStore();

  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
      console.log(
        "👁️ Видимость страницы:",
        !document.hidden ? "видна" : "скрыта",
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (isPageVisible) {
      loadInitial();
    }
  }, [isPageVisible]);

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
    </>
  );
}

export default App;

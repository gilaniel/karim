import { useEffect } from "react";
import { useActivityStore } from "@/entities/activity/store";
import { ActivityTimer } from "@/widgets/ActivityTimer";
import { ControlPanel } from "@/widgets/ControlPanel";
import { ActivityList } from "@/widgets/ActivityList";
import { Toaster } from "./shared/ui/sonner";

function App() {
  const { loadInitial } = useActivityStore();

  useEffect(() => {
    loadInitial();
  }, []);

  return (
    <>
      <Toaster />

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-rose-100  rounded-full overflow-hidden size-10">
              <img src="/kk.webp" className="object-cover object-center" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">Karim daily</h1>
          </div>
        </div>
      </header>
      <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-900">
        <div className="max-w-md mx-auto">
          <main>
            <ControlPanel />

            <ActivityTimer />

            <ActivityList />
          </main>
        </div>
      </div>
    </>
  );
}

export default App;

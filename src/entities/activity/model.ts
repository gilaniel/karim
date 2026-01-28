// Типы активностей
export type ActivityType = "SLEEP" | "AWAKE" | "FALLING_ASLEEP" | "FEEDING";

// Структура записи
export type Activity = {
  id: string;
  type: ActivityType;
  startTime: string; // ISO строка
  endTime?: string; // Может не быть, если процесс идет
  volumeMl?: number; // Только для еды
};

// Конфигурация для UI (цвета, названия)
import { Moon, Sun, type LucideProps, Milk, CloudMoon } from "lucide-react";

export const ACTIVITY_CONFIG: Record<
  ActivityType,
  {
    label: string;
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    color: string;
  }
> = {
  SLEEP: {
    label: "Сон",
    icon: Moon,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  AWAKE: {
    label: "Бодрствование",
    icon: Sun,
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  FALLING_ASLEEP: {
    label: "Укладывание",
    icon: CloudMoon,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  FEEDING: {
    label: "Кормление",
    icon: Milk,
    color: "text-green-600 bg-green-50 border-green-200",
  },
};

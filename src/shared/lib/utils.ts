export const formatDuration = (seconds: number) => {
  if (seconds < 0) return "0:00";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;

  if (seconds < 3600) {
    return `${m}:${pad(s)}`;
  }

  return `${pad(m)}:${pad(s)}`;
};

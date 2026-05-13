export function formatDuration(seconds: number): string {
  if (seconds < 60) return `약 ${seconds}초`;
  const min = Math.round(seconds / 60);
  return `약 ${min}분`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function scoreToColorClass(score: number): string {
  if (score <= 30) return "text-green-600 bg-green-50";
  if (score <= 55) return "text-yellow-600 bg-yellow-50";
  if (score <= 75) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
}

export function scoreToBadgeClass(score: number): string {
  if (score <= 30) return "bg-green-100 text-green-800 border-green-200";
  if (score <= 55) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (score <= 75) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export function scoreToBarColor(score: number): string {
  if (score <= 30) return "bg-green-500";
  if (score <= 55) return "bg-yellow-500";
  if (score <= 75) return "bg-orange-500";
  return "bg-red-500";
}

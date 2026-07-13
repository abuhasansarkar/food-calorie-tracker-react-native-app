export function formatCalories(calories: number): string {
  return `${Math.round(calories).toLocaleString()} kcal`;
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}

export function formatWeightLbs(kg: number): string {
  const lbs = kg * 2.20462;
  return `${lbs.toFixed(1)} lbs`;
}

export function formatHeight(cm: number): string {
  return `${cm} cm`;
}

export function formatProtein(g: number): string {
  return `${g.toFixed(1)}g`;
}

export function formatCarbs(g: number): string {
  return `${g.toFixed(1)}g`;
}

export function formatFat(g: number): string {
  return `${g.toFixed(1)}g`;
}

export function formatMacro(macroG: number, totalCalories: number): string {
  const percent = totalCalories > 0 ? ((macroG * 4) / totalCalories) * 100 : 0;
  return `${macroG.toFixed(1)}g (${percent.toFixed(0)}%)`;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(0)}%`;
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatStreak(days: number): string {
  if (days === 0) return "No streak";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

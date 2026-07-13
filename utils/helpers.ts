export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length - 3) + "...";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`;
}

export function getFoodIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("chicken") || n.includes("poultry")) return "🍗";
  if (n.includes("rice") || n.includes("grain")) return "🍚";
  if (n.includes("salad") || n.includes("vegetable") || n.includes("green") || n.includes("broccoli") || n.includes("spinach")) return "🥗";
  if (n.includes("apple") || n.includes("fruit") || n.includes("strawberry") || n.includes("berry")) return "🍎";
  if (n.includes("banana")) return "🍌";
  if (n.includes("egg")) return "🍳";
  if (n.includes("fish") || n.includes("salmon") || n.includes("tuna")) return "🐟";
  if (n.includes("beef") || n.includes("steak") || n.includes("meat") || n.includes("pork")) return "🥩";
  if (n.includes("bread") || n.includes("toast") || n.includes("sandwich")) return "🍞";
  if (n.includes("milk") || n.includes("yogurt") || n.includes("cheese")) return "🥛";
  if (n.includes("avocado")) return "🥑";
  if (n.includes("pizza")) return "🍕";
  if (n.includes("burger")) return "🍔";
  if (n.includes("sweet") || n.includes("cake") || n.includes("chocolate") || n.includes("cookie")) return "🍰";
  return "🍽️";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj } as Omit<T, K>;
  keys.forEach((key) => {
    delete (result as Record<string, unknown>)[key as string];
  });
  return result;
}

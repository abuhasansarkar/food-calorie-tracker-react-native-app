import { Config } from "@/constants/Config";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: "Email is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email address" };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { isValid: false, error: "Password must be less than 128 characters" };
  }
  return { isValid: true };
}

export function validateName(name: string): ValidationResult {
  if (!name.trim()) {
    return { isValid: false, error: "Name is required" };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters" };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: "Name must be less than 50 characters" };
  }
  return { isValid: true };
}

export function validateAge(age: number): ValidationResult {
  if (!age || isNaN(age)) {
    return { isValid: false, error: "Age is required" };
  }
  if (age < Config.weight.minAge || age > Config.weight.maxAge) {
    return {
      isValid: false,
      error: `Age must be between ${Config.weight.minAge} and ${Config.weight.maxAge}`,
    };
  }
  return { isValid: true };
}

export function validateHeight(cm: number): ValidationResult {
  if (!cm || isNaN(cm)) {
    return { isValid: false, error: "Height is required" };
  }
  if (cm < Config.weight.minCm || cm > Config.weight.maxCm) {
    return {
      isValid: false,
      error: `Height must be between ${Config.weight.minCm}cm and ${Config.weight.maxCm}cm`,
    };
  }
  return { isValid: true };
}

export function validateWeight(kg: number): ValidationResult {
  if (!kg || isNaN(kg)) {
    return { isValid: false, error: "Weight is required" };
  }
  if (kg < Config.weight.minKg || kg > Config.weight.maxKg) {
    return {
      isValid: false,
      error: `Weight must be between ${Config.weight.minKg}kg and ${Config.weight.maxKg}kg`,
    };
  }
  return { isValid: true };
}

export function validateGoalWeight(currentKg: number, goalKg: number): ValidationResult {
  if (!goalKg || isNaN(goalKg)) {
    return { isValid: false, error: "Goal weight is required" };
  }
  if (goalKg < Config.weight.minKg || goalKg > Config.weight.maxKg) {
    return {
      isValid: false,
      error: `Goal weight must be between ${Config.weight.minKg}kg and ${Config.weight.maxKg}kg`,
    };
  }
  return { isValid: true };
}

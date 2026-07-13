import { useAuth as useClerkAuth } from "@clerk/expo";

export function useAuth() {
  return useClerkAuth();
}

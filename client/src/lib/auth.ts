import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, organizationApi } from "./api";
import type { AuthUser, Organization } from "../types";

export function useAuth() {
  return useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include"
        });
        if (response.ok) {
          return await response.json();
        }
        return null;
      } catch {
        return null;
      }
    },
    retry: false
  });
}

export function useOrganization() {
  return useQuery<Organization>({
    queryKey: ["/api/org"],
    queryFn: organizationApi.get
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/org"] });
    }
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/org"] });
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
    }
  });
}

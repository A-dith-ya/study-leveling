import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import useUserStore from "@/app/stores/userStore";
import {
  getUserById,
  updateUserSessionStats,
  updateUserRewards,
  updateUserOwnedCosmetics,
  updateUserDecorations,
} from "@/app/services/userService";
import { Schema } from "@/amplify/data/resource";

export function useUserData() {
  const user = useUserStore((state) => state.user);

  return useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUserById(user?.id || ""),
    enabled: !!user?.id,
  });
}

export function useUpdateUserSessionStats() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: ({
      xp,
      level,
      streak,
      timeSpent,
      totalCardsReviewed,
      totalSessionsCompleted,
    }: {
      xp: number;
      level: number;
      streak: number;
      timeSpent: number;
      totalCardsReviewed: number;
      totalSessionsCompleted: number;
    }) =>
      updateUserSessionStats(
        user?.id || "",
        xp,
        level,
        streak,
        timeSpent,
        totalCardsReviewed,
        totalSessionsCompleted
      ),
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({
        queryKey: ["user", user?.id],
      });
    },
  });
}

export function useUpdateUserRewards() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: async ({ coins, xp }: { coins: number; xp: number }) =>
      updateUserRewards(user?.id || "", coins, xp),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", user?.id],
      });
    },
  });
}

export function useUpdateUserCosmetics() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      ownedCosmetics,
    }: {
      ownedCosmetics: Schema["User"]["type"]["ownedCosmetics"];
    }) => updateUserOwnedCosmetics(user?.id || "", ownedCosmetics),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", user?.id],
      });
    },
  });
}

export function useUpdateUserDecorations() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      decorations,
    }: {
      decorations: Schema["User"]["type"]["decorations"];
    }) => updateUserDecorations(user?.id || "", decorations),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", user?.id],
      });
    },
  });
}

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

const updateUserCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string | undefined,
  updatedUser: Partial<Schema["User"]["type"]>
) => {
  queryClient.setQueryData(["user", userId], (oldUser: any) => ({
    ...oldUser,
    ...updatedUser,
  }));
};

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
    onSuccess: (updatedUser) => {
      updateUserCache(
        queryClient,
        user?.id,
        updatedUser as Partial<Schema["User"]["type"]>
      );
    },
  });
}

export function useUpdateUserRewards() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      coins,
      xp,
      level,
    }: {
      coins: number;
      xp: number;
      level: number;
    }) => updateUserRewards(user?.id || "", coins, xp, level),
    onSuccess: (updatedUser) => {
      updateUserCache(
        queryClient,
        user?.id,
        updatedUser as Partial<Schema["User"]["type"]>
      );
    },
  });
}

export function useUpdateUserCosmetics() {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      coins,
      ownedCosmetics,
    }: {
      coins: number;
      ownedCosmetics: Schema["User"]["type"]["ownedCosmetics"];
    }) => updateUserOwnedCosmetics(user?.id || "", coins, ownedCosmetics),
    onSuccess: (updatedUser) => {
      updateUserCache(
        queryClient,
        user?.id,
        updatedUser as Partial<Schema["User"]["type"]>
      );
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
    onSuccess: (updatedUser) => {
      updateUserCache(
        queryClient,
        user?.id,
        updatedUser as Partial<Schema["User"]["type"]>
      );
    },
  });
}

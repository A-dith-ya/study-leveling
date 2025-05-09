import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/app/services/userService";
import useUserStore from "@/app/stores/userStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateUserSessionStats,
  updateUserRewards,
} from "@/app/services/userService";

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

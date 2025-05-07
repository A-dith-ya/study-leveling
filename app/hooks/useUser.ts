import { useQuery } from "@tanstack/react-query";
import { getUserById } from "@/app/services/userService";
import useUserStore from "@/app/stores/userStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserSessionStats } from "@/app/services/userService";

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
      xpEarned,
      timeSpent,
      totalCardsReviewed,
      totalSessionsCompleted,
    }: {
      xpEarned: number;
      timeSpent: number;
      totalCardsReviewed: number;
      totalSessionsCompleted: number;
    }) =>
      updateUserSessionStats(
        user?.id || "",
        xpEarned,
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

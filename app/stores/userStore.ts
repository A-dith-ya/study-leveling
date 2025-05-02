import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandStorage } from "./mmkv";
import { getCurrentUser } from "aws-amplify/auth";

interface User {
  id: string;
  email: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      fetchUser: async () => {
        const { userId, signInDetails } = await getCurrentUser();
        set({ user: { id: userId, email: signInDetails?.loginId || "" } });
      },
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

export default useUserStore;

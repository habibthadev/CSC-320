import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light", // 'light' or 'dark'

      // Toggle theme between light and dark
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        }));
      },

      // Set theme explicitly
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: "theme-storage",
    }
  )
);

export default useThemeStore;

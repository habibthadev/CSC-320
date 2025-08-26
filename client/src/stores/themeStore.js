import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",
      isDark: false,

      initializeTheme: () => {
        const { theme } = get();
        const isDarkMode =
          theme === "dark" ||
          (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

        set({ isDark: isDarkMode });

        if (isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      setTheme: (newTheme) => {
        const isDarkMode =
          newTheme === "dark" ||
          (newTheme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);

        set({ theme: newTheme, isDark: isDarkMode });

        if (isDarkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },

      toggleTheme: () => {
        const { isDark } = get();
        const newTheme = isDark ? "light" : "dark";
        get().setTheme(newTheme);
      },

      handleSystemThemeChange: (e) => {
        const { theme } = get();
        if (theme === "system") {
          const isDarkMode = e.matches;
          set({ isDark: isDarkMode });

          if (isDarkMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      },
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;

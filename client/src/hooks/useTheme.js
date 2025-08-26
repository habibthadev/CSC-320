import { useEffect } from "react";
import useThemeStore from "../stores/themeStore";

const useTheme = () => {
  const {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    initializeTheme,
    handleSystemThemeChange,
  } = useThemeStore();

  useEffect(() => {
    initializeTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, [initializeTheme, handleSystemThemeChange]);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,

    isLight: !isDark,
    isSystemMode: theme === "system",

    getThemeClass: (lightClass, darkClass) => (isDark ? darkClass : lightClass),

    bgPrimary: isDark ? "bg-gray-900" : "bg-white",
    bgSecondary: isDark ? "bg-gray-800" : "bg-gray-50",
    bgMuted: isDark ? "bg-gray-700" : "bg-gray-100",

    textPrimary: isDark ? "text-white" : "text-gray-900",
    textSecondary: isDark ? "text-gray-300" : "text-gray-600",
    textMuted: isDark ? "text-gray-400" : "text-gray-500",

    borderPrimary: isDark ? "border-gray-700" : "border-gray-200",
    borderSecondary: isDark ? "border-gray-600" : "border-gray-300",

    cardBg: isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
    inputBg: isDark
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900",
  };
};

export default useTheme;

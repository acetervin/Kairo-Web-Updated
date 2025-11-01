import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full transition-colors hover:bg-accent"
    >
      <span className="relative flex items-center justify-center w-full h-full">
        <Sun
          className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-500 ${
            isDark
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 rotate-90 opacity-0"
          }`}
        />
        <Moon
          className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-500 ${
            !isDark
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 -rotate-90 opacity-0"
          }`}
        />
      </span>
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>

      {/* Animated Background Ring */}
      <span
        className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isDark
            ? "bg-gradient-to-br from-amber-100/10 via-transparent to-transparent scale-100 opacity-100"
            : "bg-gradient-to-tl from-amber-500/10 via-transparent to-transparent scale-0 opacity-0"
        }`}
      />
    </Button>
  );
}

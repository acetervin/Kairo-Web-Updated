import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function BackButton() {
  const [location] = useLocation();
  const { theme } = useTheme();
  const isHomePage = location === "/";

  if (isHomePage) return null;

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="fixed left-4 top-20 z-30">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="rounded-full w-10 h-10 bg-background/50 backdrop-blur-sm border border-border
          text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all
          shadow-sm hover:shadow-md"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Go Back</span>
      </Button>
    </div>
  );
}
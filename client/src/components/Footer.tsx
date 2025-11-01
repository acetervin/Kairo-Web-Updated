import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };
  
  return (
    <footer className="bg-card text-foreground border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-playfair text-2xl font-bold mb-4">Kenya Luxury Villas</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Experience the best of Kenya with our premium collection of luxury villas and apartments. 
              From beachfront escapes to mountain retreats, we offer unforgettable stays across the country.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/properties">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Properties</span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/gallery">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Gallery</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="text-muted-foreground">
                Nairobi, Kenya
              </li>
              <li>
                <a href="tel:+254700000000" className="text-muted-foreground hover:text-primary transition-colors">
                  +254 700 000 000
                </a>
              </li>
              <li>
                <a href="mailto:info@kenyaluxuryvillas.com" className="text-muted-foreground hover:text-primary transition-colors">
                  info@kenyaluxuryvillas.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
         <div className="flex flex-col sm:flex-row items-center justify-between text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} Kenya Luxury Villas. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Link href="/privacy">
                <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
              </Link>
              <span className="text-border">|</span>
              <Link href="/terms">
                <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
              </Link>
              <span className="text-border">|</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-6 w-6 p-0 hover:bg-accent rounded-sm"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <Sun className="h-3 w-3" />
                ) : (
                  <Moon className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

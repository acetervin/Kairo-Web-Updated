import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  X, 
  Home, 
  Building2, 
  Info, 
  Image, 
  Mail,
  Sparkles,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/about", label: "About", icon: Info },
  { href: "/gallery", label: "Gallery", icon: Image },
  { href: "/contact", label: "Contact", icon: Mail },
];

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg' 
          : 'bg-background/60 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
            <Link href="/">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-2.5 rounded-xl shadow-lg group-hover:shadow-primary/25 transition-all">
                  <MapPin className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="font-inter text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Kairo Kenya
              </h1>
                <p className="text-xs text-muted-foreground font-medium -mt-0.5">
                  Luxury Stays
                </p>
              </div>
            </motion.div>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
              <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                <Button
                      variant={isActive ? "default" : "ghost"}
                  size="sm"
                      className={`relative overflow-hidden group transition-all duration-300 ${
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                          : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                      <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-primary -z-10"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                </Button>
                  </motion.div>
              </Link>
              );
            })}
            
            <div className="ml-2 pl-2 border-l border-border/50">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="relative"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {mobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                  <Menu className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[85vw] sm:w-[400px] bg-background/95 backdrop-blur-xl border-l border-border/50"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="mb-8 pb-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-primary to-primary/80 p-3 rounded-xl shadow-lg">
                        <MapPin className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="font-inter text-xl font-bold text-foreground">
                          Kairo Kenya
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Luxury Stays
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <nav className="flex-1 flex flex-col gap-2">
                    {navItems.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      
                      return (
                    <Link key={item.href} href={item.href}>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                      <Button
                              variant={isActive ? "default" : "ghost"}
                              className={`w-full justify-start h-14 text-base transition-all duration-300 ${
                                isActive 
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                                  : "hover:bg-accent hover:text-accent-foreground hover:translate-x-1"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                              <Icon className="h-5 w-5 mr-3" />
                        {item.label}
                              {isActive && (
                                <Sparkles className="h-4 w-4 ml-auto" />
                              )}
                      </Button>
                          </motion.div>
                    </Link>
                      );
                    })}
                </nav>

                  {/* Mobile Menu Footer */}
                  <div className="pt-6 mt-6 border-t border-border/50">
                    <div className="text-center text-sm text-muted-foreground">
                      <p className="font-medium">Experience Luxury</p>
                      <p className="text-xs mt-1">Premium Properties in Kenya</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

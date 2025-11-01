import { Switch, Route, useLocation } from "wouter";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import LoadingScreen from "@/components/LoadingScreen";
import Home from "@/pages/Home";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import About from "@/pages/About";
import Gallery from "@/pages/Gallery";
import Contact from "@/pages/Contact";
import BookingPage from "@/pages/BookingPage";
import CheckoutPage from "@/pages/CheckoutPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentCancelPage from "@/pages/PaymentCancelPage";

import Navigation from "@/components/Navigation";

import BackButton from "@/components/BackButton";
import StickyContactButtons from "@/components/StickyContactButtons";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import NotFound from "@/pages/not-found";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProperties from "@/pages/admin/Properties";
import AdminBookings from "@/pages/admin/Bookings";
import PropertyForm from "@/pages/admin/PropertyForm";
import AdminUsers from "@/pages/admin/Users";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

// Protected wrapper components
const ProtectedDashboard = () => (
  <ProtectedRoute>
    <AdminDashboard />
  </ProtectedRoute>
);

const ProtectedProperties = () => (
  <ProtectedRoute>
    <AdminProperties />
  </ProtectedRoute>
);

const ProtectedPropertyForm = () => (
  <ProtectedRoute>
    <PropertyForm />
  </ProtectedRoute>
);

const ProtectedBookings = () => (
  <ProtectedRoute>
    <AdminBookings />
  </ProtectedRoute>
);

const ProtectedUsers = () => (
  <ProtectedRoute>
    <AdminUsers />
  </ProtectedRoute>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/booking/:id" component={BookingPage} />
      <Route path="/checkout/:id" component={CheckoutPage} />
      <Route path="/payment-success" component={PaymentSuccessPage} />
      <Route path="/payment-cancel" component={PaymentCancelPage} />

      <Route path="/about" component={About} />

      <Route path="/gallery" component={Gallery} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={ProtectedDashboard} />
      <Route path="/admin/properties" component={ProtectedProperties} />
      <Route path="/admin/properties/new" component={ProtectedPropertyForm} />
      <Route path="/admin/properties/edit/:id" component={ProtectedPropertyForm} />
      <Route path="/admin/bookings" component={ProtectedBookings} />
      <Route path="/admin/users" component={ProtectedUsers} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="relative min-h-screen">
        <Router />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <Navigation />
      <main className="pt-20">
        <BackButton />
        <Router />
        <StickyContactButtons />
        <ScrollToTop />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Prefetch properties data during loading for instant display
    const prefetchProperties = async () => {
      try {
        await queryClient.prefetchQuery({
          queryKey: ['properties', 'all'],
          queryFn: async () => {
            const response = await fetch('/api/properties');
            if (!response.ok) return [];
            const data = await response.json();
            return data.properties || [];
          },
        });
        console.log('✅ Properties prefetched during loading screen');
      } catch (error) {
        console.error('Failed to prefetch properties:', error);
      }
    };

    prefetchProperties();

    // Simulate checking if all initial resources are loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000); // Match the 4-second animation duration

    return () => clearTimeout(timer);
  }, []);

  // Always mount QueryClientProvider early for prefetching
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={isLoading ? "light" : "dark"} storageKey="vite-ui-theme">
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import PropertySkeleton from "@/components/ui/PropertySkeleton";
import HomeSkeleton from "@/components/skeletons/HomeSkeleton";
import { ChevronRight, Building2, Home as HomeIcon, Castle, Shield, Stars, Clock, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { Property } from "@boo-back/shared/schema";
import { getProperties } from "@/data/properties";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Home() {
  // Fetch all properties once and filter client-side for better caching
  const { data: allProperties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ['properties', 'all'],
    queryFn: () => getProperties(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Filter properties by category client-side (memoized for performance)
  const apartments = useMemo(() => allProperties.filter(p => p.category === 'apartments'), [allProperties]);
  const villas = useMemo(() => allProperties.filter(p => p.category === 'villas'), [allProperties]);
  const houses = useMemo(() => allProperties.filter(p => p.category === 'houses'), [allProperties]);

  const isInitialLoading = propertiesLoading;

  if (isInitialLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1577393165327-137dce103a76?q=80&w=1920"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1582610116397-edb318620f90?q=80&w=1920";
            }}
            alt="Luxury villa in Kenya"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur px-3 py-1 text-xs sm:text-sm mb-4">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Hand‑picked stays across Kenya
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                Find extraordinary places to stay
              </h1>
              <p className="mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
                Curated villas, apartments, and homes designed for unforgettable getaways.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/properties">
                  <Button size="lg" className="min-w-[200px]">
                    Explore Stays
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary" size="lg" className="min-w-[200px]">Talk to an Advisor</Button>
                </Link>
              </div>

              {/* Quick destinations */}
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                {["Nairobi", "Diani", "Watamu", "Naivasha"].map((city) => (
                  <Link key={city} href={`/properties?location=${encodeURIComponent(city)}`}>
                    <span className="cursor-pointer rounded-full border bg-background/70 backdrop-blur px-3 py-1 hover:bg-background">
                      <MapPin className="inline h-3.5 w-3.5 mr-1 text-primary" />{city}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-b border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
          <div className="flex items-center justify-center gap-2"><Shield className="h-4 w-4 text-primary" />Secure payments</div>
          <div className="flex items-center justify-center gap-2"><Stars className="h-4 w-4 text-primary" />Verified listings</div>
          <div className="flex items-center justify-center gap-2"><Clock className="h-4 w-4 text-primary" />Instant confirmation</div>
          <div className="flex items-center justify-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Concierge support</div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Destinations grid */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Top destinations</h2>
            <p className="text-muted-foreground">Where guests love to stay</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Nairobi", img: "/nairobi.jpg" },
              { title: "Diani Beach", img: "/diani.jpg" },
              { title: "Watamu", img: "/watamu.webp" },
              { title: "Naivasha", img: "/naivasha.webp" },
            ].map(({ title, img }) => (
              <Link key={title} href={`/properties?location=${encodeURIComponent(title)}`}>
                <div className="group relative h-48 sm:h-56 rounded-xl overflow-hidden cursor-pointer">
                  <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/0" />
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full p-3 sm:p-4 text-white">
                      <div className="font-semibold text-base sm:text-lg">{title}</div>
                      <div className="text-[11px] sm:text-xs opacity-95">
                        Click to explore properties in this area
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Apartments Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <Building2 className="mr-2 h-6 w-6 text-primary" />
              Luxury Apartments
            </h2>
            <Link href="/properties?category=apartments">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apartments && apartments.length > 0 ? (
              apartments.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-3 text-center text-muted-foreground py-8">
                No apartments available at the moment.
              </div>
            )}
          </div>
        </section>

        {/* Villas Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <Castle className="mr-2 h-6 w-6 text-primary" />
              Exclusive Villas
            </h2>
            <Link href="/properties?category=villas">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {villas && villas.length > 0 ? (
              villas.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-3 text-center text-muted-foreground py-8">
                No villas available at the moment.
              </div>
            )}
          </div>
        </section>

        {/* Houses Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <HomeIcon className="mr-2 h-6 w-6 text-primary" />
              Premium Houses
            </h2>
            <Link href="/properties?category=houses">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {houses && houses.length > 0 ? (
              houses.slice(0, 3).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="col-span-3 text-center text-muted-foreground py-8">
                No houses available at the moment.
              </div>
            )}
          </div>
        </section>
      </div>
      {/* How it works */}
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{title:'Browse and choose', desc:'Explore curated homes in the best locations.'}, {title:'Book securely', desc:'Pay online with instant confirmation.'}, {title:'Enjoy your stay', desc:'Concierge support throughout your trip.'}].map((step, i) => (
            <div key={i} className="rounded-xl border p-6 bg-card">
              <div className="text-3xl font-bold text-primary mb-2">0{i+1}</div>
              <div className="font-semibold">{step.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

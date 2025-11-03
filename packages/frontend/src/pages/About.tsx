import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { memo } from "react";

const Stats = memo(() => (
  <div className="grid grid-cols-2 gap-6 mb-8">
    <div className="text-center">
      <div className="text-3xl font-bold text-terracotta mb-2">50+</div>
      <div className="text-gray-600">Premium Properties</div>
    </div>
    <div className="text-center">
      <div className="text-3xl font-bold text-terracotta mb-2">10,000+</div>
      <div className="text-gray-600">Happy Guests</div>
    </div>
    <div className="text-center">
      <div className="text-3xl font-bold text-terracotta mb-2">15+</div>
      <div className="text-gray-600">Years Experience</div>
    </div>
    <div className="text-center">
      <div className="text-3xl font-bold text-terracotta mb-2">24/7</div>
      <div className="text-gray-600">Guest Support</div>
    </div>
  </div>
));

const Gallery = memo(() => {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b?auto=format&fit=crop&w=400&h=600",
      alt: "Kenyan savannah sunset",
      className: "rounded-xl shadow-lg w-full h-64 object-cover",
      width: 400,
      height: 600,
      style: { aspectRatio: "2/3" },
    },
    {
      src: "https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?auto=format&fit=crop&w=400&h=400",
      alt: "African elephants in Kenya",
      className: "rounded-xl shadow-lg w-full h-48 object-cover mt-8",
      width: 400,
      height: 400,
      style: { aspectRatio: "1/1" },
    },
    {
      src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&h=400",
      alt: "Pristine Kenyan beach",
      className: "rounded-xl shadow-lg w-full h-48 object-cover",
      width: 400,
      height: 400,
      style: { aspectRatio: "1/1" },
    },
    {
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&h=600",
      alt: "Mount Kenya at sunrise",
      className: "rounded-xl shadow-lg w-full h-64 object-cover mt-8",
      width: 400,
      height: 600,
      style: { aspectRatio: "2/3" },
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          className={img.className}
          width={img.width}
          height={img.height}
          loading="lazy"
          decoding="async"
          style={img.style}
          fetchpriority={i === 0 ? "high" : undefined}
        />
      ))}
    </div>
  );
});

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen py-20 bg-sandy-beige/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-deep-navy mb-6">
              About Kairo Kenya
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              We are your premier destination for modern, comfortable stays in Kenya's most vibrant locations.
              Our properties are strategically placed in prime areas, ensuring you're always minutes away from
              shopping centers, restaurants, and business districts.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Whether you're in Westlands, Kilimani, or Karen, our properties offer the perfect blend of
              contemporary living and convenience. Each location provides easy access to major highways,
              airports, and essential amenities, making your stay effortlessly comfortable.
            </p>
            <Stats />
            <div className="flex gap-4">
              <Link href="/contact">
                <Button className="bg-terracotta hover:bg-orange-600 text-white">
                  Get in Touch
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" className="border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white">
                  View Gallery
                </Button>
              </Link>
            </div>
          </div>
          <Gallery />
        </div>
        {/* Mission & Values */}
        <div className="mt-20">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-deep-navy mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience modern comfort with unmatched convenience and accessibility
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-terracotta/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="font-playfair text-xl font-semibold text-deep-navy mb-3">
                  Sustainable Tourism
                </h3>
                <p className="text-gray-600">
                  We promote responsible tourism that supports local communities and preserves Kenya's natural heritage.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-terracotta/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="font-playfair text-xl font-semibold text-deep-navy mb-3">
                  Exceptional Service
                </h3>
                <p className="text-gray-600">
                  Our dedicated team ensures every guest receives personalized attention and world-class hospitality.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8 text-center">
                <div className="bg-terracotta/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏡</span>
                </div>
                <h3 className="font-playfair text-xl font-semibold text-deep-navy mb-3">
                  Authentic Experiences
                </h3>
                <p className="text-gray-600">
                  We curate unique properties that showcase the true essence of Kenya's diverse landscapes and cultures.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

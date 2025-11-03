import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Shield, Smartphone, CreditCard, DollarSign } from "lucide-react";
import type { InsertContactMessage } from "@boo-back/shared/schema";
import { useTheme } from "@/hooks/use-theme";
import { motion } from "framer-motion";

export default function Contact() {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen py-20 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have a question about our properties? We're here to help you find your perfect stay in Kenya
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-card border-border hover:shadow-md transition-all duration-300">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      className="bg-background border-border focus:ring-primary"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      className="bg-background border-border focus:ring-primary"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-background border-border focus:ring-primary"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    className="bg-background border-border focus:ring-primary"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="propertyInterest" className="text-sm font-medium text-foreground">
                    Interested In
                  </label>
                  <Select
                    disabled
                  >
                    <SelectTrigger id="propertyInterest" className="bg-background border-border">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Luxury Apartment</SelectItem>
                      <SelectItem value="villa">Private Villa</SelectItem>
                      <SelectItem value="house">Vacation Home</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    className="bg-background border-border focus:ring-primary min-h-[150px]"
                    disabled
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled
                >
                  Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Info Cards */}
              <Card className="bg-card border-border hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <Phone className="h-6 w-6 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Phone</h3>
                  <p className="text-muted-foreground">+254 700 000 000</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <Mail className="h-6 w-6 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Email</h3>
                  <p className="text-muted-foreground">info@kenyaluxuryvillas.com</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <MapPin className="h-6 w-6 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Location</h3>
                  <p className="text-muted-foreground">Nairobi, Kenya</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <MessageCircle className="h-6 w-6 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">WhatsApp</h3>
                  <p className="text-muted-foreground">+254 700 000 000</p>
                </CardContent>
              </Card>
            </div>

            {/* Trust Indicators */}
            <Card className="bg-card border-border hover:shadow-md transition-all duration-300">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Why Book With Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <h4 className="font-medium text-foreground">Secure Booking</h4>
                      <p className="text-sm text-muted-foreground">Your data and payments are protected</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Smartphone className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <h4 className="font-medium text-foreground">24/7 Support</h4>
                      <p className="text-sm text-muted-foreground">Always here when you need us</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <h4 className="font-medium text-foreground">Flexible Payment</h4>
                      <p className="text-sm text-muted-foreground">Multiple payment options available</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-primary mt-1 mr-3" />
                    <div>
                      <h4 className="font-medium text-foreground">Best Price Guarantee</h4>
                      <p className="text-sm text-muted-foreground">Get the best value for your stay</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

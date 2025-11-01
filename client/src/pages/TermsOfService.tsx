import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen py-20 bg-background"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
            
            <div className="prose dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using Luxury Kenya Stays, you accept and agree to be bound by the terms
                  and conditions of this agreement. If you do not agree to these terms, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Booking and Payments</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>All bookings are subject to availability and confirmation</li>
                  <li>Payment is required to confirm your booking</li>
                  <li>Prices are in Kenyan Shillings unless otherwise stated</li>
                  <li>Additional fees (cleaning, security deposit) may apply</li>
                  <li>We accept payments via PayPal and other specified methods</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Cancellation Policy</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Free cancellation up to 48 hours before check-in</li>
                  <li>50% refund for cancellations 24-48 hours before check-in</li>
                  <li>No refund for cancellations less than 24 hours before check-in</li>
                  <li>Force majeure circumstances will be evaluated case by case</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibilities</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide accurate information when booking</li>
                  <li>Respect property rules and guidelines</li>
                  <li>Report any issues promptly</li>
                  <li>Be responsible for all guests in your party</li>
                  <li>Do not engage in illegal activities on the properties</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Property Rules</h2>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Check-in and check-out times must be respected</li>
                  <li>No smoking in non-smoking properties</li>
                  <li>No unauthorized parties or events</li>
                  <li>Pets only allowed in designated properties</li>
                  <li>Respect noise regulations and neighbors</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Liability</h2>
                <p className="text-muted-foreground">
                  Luxury Kenya Stays acts as an intermediary between guests and property owners.
                  While we verify properties to the best of our ability, we cannot be held liable for:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
                  <li>Property conditions beyond our control</li>
                  <li>Personal injury during stays</li>
                  <li>Loss or damage of personal belongings</li>
                  <li>Force majeure events</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. Changes will be effective
                  immediately upon posting to the website. Your continued use of the service constitutes
                  acceptance of the modified terms.
                </p>
              </section>

              <p className="text-sm text-muted-foreground mt-8">
                Last updated: May 25, 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

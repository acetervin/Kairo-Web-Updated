import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
            
            <div className="prose dark:prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect information that you provide directly to us, including when you:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
                  <li>Create an account or make a booking</li>
                  <li>Contact us through our website or messaging services</li>
                  <li>Subscribe to our newsletter or updates</li>
                  <li>Make payments through our platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
                  <li>Process your bookings and payments</li>
                  <li>Communicate with you about your reservations</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Information Sharing</h2>
                <p className="text-muted-foreground">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
                  <li>Property owners/managers to facilitate bookings</li>
                  <li>Payment processors to handle transactions</li>
                  <li>Service providers who assist our operations</li>
                  <li>Legal authorities when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal information. 
                  However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
                <p className="text-muted-foreground">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
                  <br />
                  Email: privacy@kenyaluxurystays.com
                  <br />
                  Phone: +254 700 000 000
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

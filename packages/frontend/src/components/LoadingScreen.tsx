import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Home } from "lucide-react";

export default function LoadingScreen() {
  const controls = useAnimation();
  
  useEffect(() => {
    controls.start({
      opacity: [1, 0],
      transition: { duration: 0.5, delay: 2.5 }
    });
  }, [controls]);

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center bg-background z-50"
      animate={controls}
      initial={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        {/* Bouncing Home Icon */}
        <motion.div
          className="mb-6"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Home 
            size={60} 
            className="text-primary mx-auto" 
          />
        </motion.div>

        {/* Simple Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-2xl font-inter font-semibold text-primary mb-2">
            Kenya Luxury Villas
          </h1>
          <p className="text-muted-foreground text-sm">
            Loading your perfect stay...
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

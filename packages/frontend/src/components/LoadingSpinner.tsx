import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Wind, Sun, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const BubbleEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-200 opacity-70 pointer-events-none"
          style={{
            width: Math.random() * 30 + 10,
            height: Math.random() * 30 + 10,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ scale: 0, opacity: 0.7 }}
          animate={{
            y: [0, -500 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 100],
            scale: [0, 1 + Math.random()],
            opacity: [0.7, 0]
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

const WashingPhases = ({ phase }: { phase: number }) => {
  const phases = [
    { icon: <Droplet className="text-blue-300" size={24} />, text: "Washing" },
    { icon: <Wind className="text-blue-300" size={24} />, text: "Spinning" },
    { icon: <Sun className="text-yellow-300" size={24} />, text: "Drying" },
    { icon: <Sparkles className="text-yellow-200" size={24} />, text: "Finishing" }
  ];
  
  return (
    <div className="flex space-x-4 mt-6">
      {phases.map((p, i) => (
        <motion.div 
          key={i}
          className={`flex flex-col items-center ${i === phase ? "opacity-100" : "opacity-40"}`}
          animate={i === phase ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: i === phase ? Infinity : 0 }}
        >
          <div className="mb-2">{p.icon}</div>
          <span className="text-xs text-blue-100">{p.text}</span>
          {i === phase && (
            <motion.div 
              className="h-1 w-6 bg-blue-300 mt-1 rounded-full"
              layoutId="activePhase"
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

const LoadingSpinner = ({ isLoading, setIsLoading }: LoadingSpinnerProps) => {
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    if (!isLoading) return;
    
    // Simulate loading phases
    const phaseInterval = setInterval(() => {
      setLoadingPhase(prev => (prev + 1) % 4);
    }, 1500);
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + (5 + Math.random() * 10);
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 400);
    
    // Complete loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, setIsLoading]);

  if (!isLoading) return null;

  const loadingMessages = [
    "Preparing fresh linens...",
    "Adding eco-friendly detergent...",
    "Setting perfect temperature...",
    "Polishing our service for you..."
  ];

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-b from-primary to-blue-800 flex flex-col items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.8, ease: "easeInOut" }
      }}
      style={{ pointerEvents: "none" }}
    >
      <BubbleEffect />
      
      <motion.div
        className="relative w-40 h-40 mb-8"
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { 
              repeat: Infinity, 
              duration: 3,
              ease: "linear"
            }
          }}
          className="w-full h-full"
        >
        </motion.div>
        
        {/* Water effect animation */}
        <motion.div 
          className="absolute inset-x-0 bottom-0 bg-blue-400 opacity-40 rounded-b-full overflow-hidden"
          initial={{ height: "20%" }}
          animate={{ 
            height: ["20%", "60%", "40%", "50%"],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        >
          <motion.div 
            className="absolute inset-0 bg-blue-300"
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
            style={{
              backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJ3YXZlIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiBwYXR0ZXJuVHJhbnNmb3JtPSJzY2FsZSgxLjUpIj4KICAgICAgPHBhdGggZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjIpIiBkPSJNMCAxNSBRMjUgNSA1MCAxNSBRNzUgMjUgMTAwIDE1IEwxMDAgMzAgTDAgMzAgWiIgLz4KICAgIDwvcGF0dGVybj4KPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd2F2ZSkiIC8+Cjwvc3ZnPg==')"
            }}
          />
        </motion.div>
      </motion.div>
      
      <motion.h2 
        className="text-white text-2xl font-bold tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Padmore Residence
      </motion.h2>
      
      <motion.h3 
        className="text-blue-100 text-lg font-semibold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Laundromat
      </motion.h3>
      
      <AnimatePresence mode="wait">
        <motion.p 
          key={loadingPhase}
          className="text-blue-100 text-sm mt-2 h-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {loadingMessages[loadingPhase]}
        </motion.p>
      </AnimatePresence>
      
      {/* Progress bar */}
      <motion.div 
        className="w-64 h-2 bg-blue-900/50 rounded-full mt-4 overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-300 to-blue-100 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
      
      <WashingPhases phase={loadingPhase} />
    </motion.div>
  );
}

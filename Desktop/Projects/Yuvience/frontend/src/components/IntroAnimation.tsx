import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => onComplete(), 3500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(240 15% 6%) 0%, hsl(265 85% 8%) 50%, hsl(225 70% 10%) 100%)",
        }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Animated Background Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              style={{
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                y: [0, -100],
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Glow Effects */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(265 80% 55% / 0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute w-72 h-72 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(225 85% 50% / 0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
            left: "60%",
            top: "30%",
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Logo Icon */}
          <motion.div
            className="mb-8 flex justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={phase >= 0 ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="relative">
              <motion.div
                className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(265 80% 55%) 0%, hsl(225 85% 50%) 100%)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 30px hsl(265 80% 55% / 0.4)",
                    "0 0 60px hsl(265 80% 55% / 0.6)",
                    "0 0 30px hsl(265 80% 55% / 0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-4xl font-display font-bold text-primary-foreground">Y</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.h1
            className="text-6xl md:text-7xl font-display font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="gradient-text">Yutende</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-xl text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Your Digital Universe, Unified
          </motion.p>

          {/* Loading Bar */}
          <motion.div
            className="w-64 h-1 mx-auto rounded-full overflow-hidden"
            style={{ background: "hsl(var(--muted))" }}
            initial={{ opacity: 0 }}
            animate={phase >= 2 ? { opacity: 1 } : {}}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(265 80% 55%) 0%, hsl(225 85% 50%) 100%)",
              }}
              initial={{ width: "0%" }}
              animate={phase >= 2 ? { width: "100%" } : {}}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntroAnimation;

import React from 'react';
import { motion } from 'framer-motion';

const LoadingDNA: React.FC = () => {
  // Number of dots in one strand
  const numDots = 12;

  return (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <div className="relative w-16 h-40 flex justify-center items-center">
        {/* Strand 1 */}
        {[...Array(numDots)].map((_, i) => (
          <motion.div
            key={`strand1-${i}`}
            className="absolute w-3 h-3 rounded-full bg-blue-500 shadow-md shadow-blue-500/30"
            style={{ top: `${(i / (numDots - 1)) * 100}%` }}
            animate={{
              x: [-20, 20, -20],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.6, 1, 0.6],
              zIndex: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}

        {/* Strand 2 (Opposite Phase) */}
        {[...Array(numDots)].map((_, i) => (
          <motion.div
            key={`strand2-${i}`}
            className="absolute w-3 h-3 rounded-full bg-teal-400 shadow-md shadow-teal-400/30"
            style={{ top: `${(i / (numDots - 1)) * 100}%` }}
            animate={{
              x: [20, -20, 20],
              scale: [1.2, 0.8, 1.2],
              opacity: [1, 0.6, 1],
              zIndex: [10, 0, 10],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mt-6 text-sm font-medium text-slate-500 tracking-wider uppercase"
      >
        Analisando Evidências...
      </motion.p>
    </div>
  );
};

export default LoadingDNA;
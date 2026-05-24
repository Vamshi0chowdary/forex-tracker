import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function LoadingOverlay({ mode, title, message, note }) {
  return (
    <motion.div
      className={`loading-overlay loading-overlay--${mode}`}
      initial={{ opacity: 0, filter: 'blur(12px)', y: mode === 'initial' ? 16 : 0 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      exit={{ opacity: 0, filter: 'blur(12px)', y: 10 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="loading-card glass-panel"
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="loading-logo"
          animate={{ rotate: [0, 8, 0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          FX
        </motion.div>

        <div className="loading-copy">
          <AnimatePresence mode="wait">
            <motion.h2
              key={title}
              className="loading-title"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {title}
            </motion.h2>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={message}
              className="loading-message"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {message}
            </motion.p>
          </AnimatePresence>

          <p className="loading-note">{note}</p>
        </div>

        <div className="loading-progress" aria-hidden="true">
          <motion.div
            className="loading-progress__fill"
            animate={{ x: ['-20%', '110%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LoadingOverlay;
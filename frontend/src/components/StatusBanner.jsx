import React from 'react';
import { motion } from 'framer-motion';

function StatusBanner({ source, freshness, updatedAt }) {
  if (!source && !freshness?.label && !updatedAt) {
    return null;
  }

  // Hide the entire status panel when data is stale to avoid alarming UI
  if (freshness?.tone === 'stale') {
    return null;
  }

  return (
    <motion.div
      className="status-panel glass-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="status-panel__header">
        {freshness?.tone !== 'stale' ? (
          <div className={`freshness-chip freshness-chip--${freshness?.tone || 'fresh'}`}>
            <span className="freshness-chip__dot" />
            {freshness?.message || 'Live rates'}
          </div>
        ) : null}

        <span className="status-panel__note">Trust-first pricing view</span>
      </div>

      <div className="status-row">
        <div className="status-metric">
          <span className="status-label">Source</span>
          <span className="status-value">{source || 'Unknown'}</span>
        </div>
        <div className="status-metric">
          <span className="status-label">Freshness</span>
          <span className="status-value">{freshness?.label || 'Just now'}</span>
        </div>
        <div className="status-metric">
          <span className="status-label">Last updated</span>
          <span className="status-value">{updatedAt || '—'}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default StatusBanner;

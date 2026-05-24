import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function RatesTable({ rates, base, loading, error, freshness }) {
  const entries = Object.entries(rates || {});

  if (loading && entries.length === 0) {
    return (
      <motion.div
        className="state-card state-card--loading glass-panel"
        aria-live="polite"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="spinner" aria-hidden="true" />
        <div>
          <div className="state-card__title">Loading live rates</div>
          <div className="state-card__text">Fetching the latest exchange data from the provider chain.</div>
        </div>
      </motion.div>
    );
  }

  if (error && entries.length === 0) {
    return (
      <motion.div
        className="state-card state-card--error glass-panel--soft"
        role="alert"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="state-card__title">Unable to load rates</div>
        <div className="state-card__text">{error}</div>
      </motion.div>
    );
  }

  if (entries.length === 0) {
    return (
      <motion.div
        className="state-card state-card--empty glass-panel"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="state-card__title">No exchange rates available</div>
        <div className="state-card__text">Try refreshing or switching the base currency.</div>
      </motion.div>
    );
  }

  return (
    <div className="rates-section">
      <div className="rates-section__header">
        <div>
          <h2 className="section-title">Exchange rates</h2>
          <p className="section-subtitle">1 {base} converted into each currency below.</p>
        </div>

        {freshness?.tone !== 'stale' ? (
          <div className={`mini-pill mini-pill--${freshness?.tone || 'fresh'}`}>
            {freshness?.message || 'Live rates'}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="inline-note" aria-live="polite">
          <span className="spinner spinner--small" aria-hidden="true" />
          Refreshing rates in the background
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          className="rates-grid"
          key={entries.map(([currency]) => currency).join('|')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {entries.map(([currency, rate], index) => {
            const formattedRate = Number(rate).toLocaleString(undefined, { maximumFractionDigits: 6 });

            return (
              <motion.article
                key={currency}
                className="rate-card glass-panel"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="rate-card__topline">
                  <span className="rate-card__currency">{currency}</span>
                  <span className={`rate-card__dot rate-card__dot--${freshness?.tone || 'fresh'}`} />
                </div>

                <div className="rate-card__rate">{formattedRate}</div>

                <div className="rate-card__meta">1 {base} ≈ {formattedRate} {currency}</div>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default RatesTable;

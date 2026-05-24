import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchRates } from './api';
import CurrencySelector from './components/CurrencySelector';
import LoadingOverlay from './components/LoadingOverlay';
const PremiumBackground = React.lazy(() => import('./components/PremiumBackground'));
import RatesTable from './components/RatesTable';
import StatusBanner from './components/StatusBanner';

const DEFAULT_BASE = 'USD';
const AUTO_REFRESH_MS = 60000;
const FRESH_SECONDS = 60;
const RECENT_SECONDS = 180;
const LOADING_MESSAGES = [
  'Fetching live forex rates...',
  'Aggregating providers...',
  'Preparing dashboard...',
  'Optimizing reliability...',
];

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

function App() {
  const requestIdRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);

  const [base, setBase] = useState(DEFAULT_BASE);
  const [rates, setRates] = useState({});
  const [source, setSource] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(true);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState('');
  const [loadingStage, setLoadingStage] = useState(0);

  const loadRates = useCallback(async (nextBase = DEFAULT_BASE) => {
    const normalizedBase = String(nextBase || DEFAULT_BASE).trim().toUpperCase();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError('');

    try {
      const data = await fetchRates(normalizedBase);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setBase(data.base || normalizedBase);
      setRates(data.rates || {});
      setSource(data.source || 'Unknown');
      setTimestamp(data.timestamp || '');
    } catch (requestError) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setError('Unable to load exchange rates right now.');
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
        if (!hasLoadedOnceRef.current) {
          hasLoadedOnceRef.current = true;
          setBooting(false);
        }
      }
    }
  }, []);

  useEffect(() => {
    void loadRates(base);

    const intervalId = window.setInterval(() => {
      void loadRates(base);
    }, AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [base, loadRates]);

  useEffect(() => {
    if (!loading) {
      setLoadingStage(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setLoadingStage((stage) => (stage + 1) % LOADING_MESSAGES.length);
    }, 1200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loading]);

  const freshness = useMemo(() => {
    if (!timestamp) {
      return {
        label: 'Freshness unavailable',
        tone: 'fresh',
        message: 'Live rates',
        ageText: '',
      };
    }

    const ageSeconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));

    if (Number.isNaN(ageSeconds)) {
      return {
        label: 'Freshness unavailable',
        tone: 'fresh',
        message: 'Live rates',
        ageText: '',
      };
    }

    if (ageSeconds < FRESH_SECONDS) {
      return {
        label: `${ageSeconds}s old`,
        tone: 'fresh',
        message: 'Live rates',
        ageText: formatAge(ageSeconds),
      };
    }

    if (ageSeconds < RECENT_SECONDS) {
      return {
        label: `${formatAge(ageSeconds)} old`,
        tone: 'recent',
        message: 'Recently updated',
        ageText: formatAge(ageSeconds),
      };
    }

    return {
      label: `${formatAge(ageSeconds)} old`,
      tone: 'stale',
      message: 'Using cached backup data',
      ageText: formatAge(ageSeconds),
    };
  }, [timestamp, rates]);

  const lastUpdatedText = useMemo(() => {
    if (!timestamp) {
      return '';
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString();
  }, [timestamp]);

  const hasRates = Object.keys(rates).length > 0;
  const loadingMode = booting ? 'initial' : loading ? 'refresh' : null;

  return (
    <div className="app-shell">
      <Suspense fallback={<div className="premium-background premium-background--fallback" aria-hidden="true" />}>
        <PremiumBackground />
      </Suspense>

      <AnimatePresence>
        {loadingMode ? (
          <LoadingOverlay
            key="loading-overlay"
            mode={loadingMode}
            message={LOADING_MESSAGES[loadingStage]}
            title={loadingMode === 'initial' ? 'Preparing dashboard' : 'Updating live rates'}
            note={loadingMode === 'initial' ? 'Optimizing reliability...' : 'Refresh in progress...'}
          />
        ) : null}
      </AnimatePresence>

      <motion.main
        className="dashboard-shell"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        <motion.section className="dashboard-card glass-panel" variants={pageVariants}>
          <motion.header className="hero" variants={fadeUpVariants}>
            <div className="hero__eyebrow-row">
              <span className="hero__eyebrow">Real-time forex intelligence</span>
              {freshness?.tone !== 'stale' ? (
                <span className={`hero__status hero__status--${freshness.tone}`}>
                  {freshness.message}
                </span>
              ) : null}
            </div>

            <h1>Premium forex rates with graceful fallback</h1>
            <p className="subtext">
              A polished fintech dashboard that keeps the user experience trustworthy even when free APIs fail or
              return stale data.
            </p>

            <div className="hero-metrics">
              <motion.div className="metric-card" variants={fadeUpVariants} whileHover={{ y: -4 }}>
                <span className="metric-card__label">Base currency</span>
                <strong className="metric-card__value">{base}</strong>
              </motion.div>

              <motion.div className="metric-card" variants={fadeUpVariants} whileHover={{ y: -4 }}>
                <span className="metric-card__label">Source</span>
                <strong className="metric-card__value">{source || 'Waiting for live data'}</strong>
              </motion.div>

              <motion.div className="metric-card" variants={fadeUpVariants} whileHover={{ y: -4 }}>
                <span className="metric-card__label">Freshness</span>
                <strong className="metric-card__value">{freshness.label}</strong>
              </motion.div>
            </div>
          </motion.header>

          <div className="dashboard-content">
            <motion.div variants={fadeUpVariants}>
              <CurrencySelector
                value={base}
                onChange={(nextBase) => {
                  setBase(nextBase);
                }}
                onRefresh={() => loadRates(base)}
                loading={loading}
              />
            </motion.div>

            <motion.div variants={fadeUpVariants}>
              <StatusBanner source={source} freshness={freshness} updatedAt={lastUpdatedText} />
            </motion.div>

            {error && hasRates ? (
              <motion.div className="error-banner glass-panel--soft" variants={fadeUpVariants}>
                {error}
              </motion.div>
            ) : null}

            <motion.div variants={fadeUpVariants}>
              <RatesTable rates={rates} base={base} loading={loading} error={error} freshness={freshness} />
            </motion.div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}

function formatAge(ageSeconds) {
  if (ageSeconds < 60) {
    return `${ageSeconds}s`;
  }

  const minutes = Math.floor(ageSeconds / 60);
  const seconds = ageSeconds % 60;

  if (minutes < 60) {
    return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

export default App;

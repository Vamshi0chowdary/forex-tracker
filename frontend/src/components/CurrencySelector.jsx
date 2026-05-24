import React from 'react';
import { motion } from 'framer-motion';
import CustomSelect from './CustomSelect';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF'];

function CurrencySelector({ value, onChange, onRefresh, loading }) {
  return (
    <motion.div
      className="toolbar glass-panel--soft"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
        <label className="field">
        <span className="field__label">Base currency</span>
        <CustomSelect
          id="base-currency-select"
          ariaLabel="Base currency"
          options={CURRENCIES}
          value={value}
          onChange={onChange}
        />
      </label>

      <motion.button
        className="refresh-button"
        type="button"
        onClick={onRefresh}
        disabled={loading}
        whileHover={loading ? undefined : { scale: 1.02, y: -1 }}
        whileTap={loading ? undefined : { scale: 0.98 }}
      >
        {loading ? (
          <>
            <span className="spinner spinner--button" aria-hidden="true" />
            Refreshing...
          </>
        ) : (
          'Refresh'
        )}
      </motion.button>
    </motion.div>
  );
}

export default CurrencySelector;

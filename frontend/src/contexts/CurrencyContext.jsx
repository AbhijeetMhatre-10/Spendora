import React, { createContext, useState, useEffect } from 'react';
import { supportedCurrencies } from '../config/currencies';
import useAuth from '../hooks/useAuth';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const storedCode = localStorage.getItem('currencyCode');
    return supportedCurrencies.find(({ code }) => code === storedCode) || supportedCurrencies[0];
  });
  const { user } = useAuth();

  useEffect(() => {
    const storedCode = localStorage.getItem('currencyCode');
    const preferredCode = storedCode || user?.defaultCurrency;
    const preferredCurrency = supportedCurrencies.find(c => c.code === preferredCode);

    if (preferredCurrency) {
      setCurrency(preferredCurrency);
      if (!storedCode) {
        localStorage.setItem('currencyCode', preferredCurrency.code);
      }
    }
  }, [user]);

  const changeCurrency = (currencyCode) => {
    const newCurrency = supportedCurrencies.find(c => c.code === currencyCode);
    if (newCurrency) {
      setCurrency(newCurrency);
      localStorage.setItem('currencyCode', newCurrency.code);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, supportedCurrencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
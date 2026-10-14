import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkHealth } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshHealthStatus = async () => {
    setLoading(true);
    const data = await checkHealth();
    setHealthStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshHealthStatus();
  }, []);

  return (
    <AppContext.Provider value={{ healthStatus, loading, refreshHealthStatus }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

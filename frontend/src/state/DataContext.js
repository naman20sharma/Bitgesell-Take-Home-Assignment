import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0
  });

  const fetchItems = useCallback(async (searchQuery = '', page = 1, limit = 50) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString()
      });

      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }

      const response = await fetch(`http://localhost:3001/api/items?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.items) {
        setItems(data.items);
        setPagination(data.pagination || { page, total: data.items.length, totalPages: 1 });
      } else {
        setItems(data);
        setPagination({ page, total: data.length, totalPages: 1 });
      }

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    items,
    loading,
    error,
    pagination,
    fetchItems
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
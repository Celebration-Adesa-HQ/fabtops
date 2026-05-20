'use client';

import { useState, useEffect, useCallback } from 'react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

let cachedCustomer: Customer | null | undefined = undefined; // undefined = not checked yet

export function useAuth() {
  const [customer, setCustomer] = useState<Customer | null | undefined>(cachedCustomer);
  const [loading, setLoading] = useState(cachedCustomer === undefined);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/customer');
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          cachedCustomer = result.data;
          setCustomer(result.data);
        } else {
          cachedCustomer = null;
          setCustomer(null);
        }
      } else {
        cachedCustomer = null;
        setCustomer(null);
      }
    } catch {
      cachedCustomer = null;
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cachedCustomer === undefined) {
      fetchCustomer();
    }
  }, [fetchCustomer]);

  const refresh = () => {
    cachedCustomer = undefined;
    fetchCustomer();
  };

  return {
    customer,
    isAuthenticated: !!customer,
    loading,
    refresh,
  };
}

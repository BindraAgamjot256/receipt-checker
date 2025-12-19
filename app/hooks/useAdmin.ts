import { useState, useEffect } from 'react';

const SECRET_CODE = '676767-69420';
const STORAGE_KEY_CODE = 'FUCK_YOU';
const STORAGE_KEY_NAME = 'FUCK_YOU_MORE';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [issuerName, setIssuerName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedCode = localStorage.getItem(STORAGE_KEY_CODE);
    const storedName = localStorage.getItem(STORAGE_KEY_NAME);

    if (storedCode === SECRET_CODE) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAdmin(true);
    }
    if (storedName) {
      setIssuerName(storedName);
    }
    setIsLoaded(true);
  }, []);

  const login = (code: string, name: string) => {
    if (code === SECRET_CODE) {
      localStorage.setItem(STORAGE_KEY_CODE, code);
      localStorage.setItem(STORAGE_KEY_NAME, name);
      setIsAdmin(true);
      setIssuerName(name);
      return true;
    }
    return false;
  };

  return { isAdmin, issuerName, login, isLoaded };
}

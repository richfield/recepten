import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { ApplicationContext } from "./ApplicationContext.js";
import { Language } from "../../Types.js";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from '../../main.js';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

interface ApplicationContextProviderProps {
  children: React.ReactNode;
}

export const ApplicationContextProvider: React.FC<ApplicationContextProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(darkTheme);
  const [language, setLanguage] = useState<Language>("nl")
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme.palette.mode === 'light' ? darkTheme : lightTheme));
  };
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await auth.signOut();
  };
  return (
    <ApplicationContext.Provider value={{ theme, toggleTheme, language, setLanguage, user, signOut }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ApplicationContext.Provider>
  );
};

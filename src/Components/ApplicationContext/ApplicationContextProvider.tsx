import React, { useState, useEffect, useCallback } from 'react';
import { createTheme, Theme, ThemeProvider } from '@mui/material';
import { AxiosResponse } from 'axios';
import { User } from 'firebase/auth';
import { ReactNode } from 'react';
import { Language, RoleData, UserProfile } from '../../Types.js';
import axios from 'axios';
import { firebaseAuth } from '../../main.js';
import { ApplicationContext } from "./ApplicationContext.js";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

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
  children: ReactNode;
}

export const ApplicationContextProvider: React.FC<ApplicationContextProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(darkTheme);
  const [language, setLanguage] = useState<Language>("nl");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [adminRole, setAdminRole] = useState<RoleData>();
  const [isAdmin, setIsAdmin ] = useState<boolean>(false);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme.palette.mode === 'light' ? darkTheme : lightTheme));
  };

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseAuth.signOut();
  };

  const apiFetch = useCallback(async <T,>(url: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: unknown, headers?: object): Promise<AxiosResponse<T, unknown>> => {
    if (!user) {
      throw new Error("not authenticated");
    }

    const token = await user.getIdToken();
    const config = {
      method,
      url,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...headers
      },
      data: body
    };

    return await axios(config);
  }, [user]);

  const fetchAuthenticatedImage = async (url: string): Promise<string> => {
    if (!user) {
      throw new Error("not authenticated");
    }

    const token = await user.getIdToken();
    let response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    for (let i = 0; i < 3; i++) {
      if (response.status === 500) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        break;
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid !== profile?.firebaseUID) {
        const response = await apiFetch<UserProfile>('/api/profile/me', 'GET');
        setProfile(response.data);
      }
    };
    fetchProfile();
  }, [user, profile, apiFetch])

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const {data} = await apiFetch<RoleData[]>('/api/profile/roles', 'GET');
        const adminRole = data.find(d => d.name.toLowerCase() === "admin")
        setAdminRole(adminRole);
      }
    };
    fetchProfile();
  }, [user, apiFetch])

  useEffect(() => {
    if(adminRole) {
      const hasAdminRole = profile?.roles.findIndex(r => r === adminRole._id) ?? -1;
      setIsAdmin(hasAdminRole > -1)
    }
  }, [profile, adminRole])

  useEffect(() => {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    switch (profile?.settings.theme) {
      case "dark":
        setTheme(darkTheme);
        break;
      case "light":
        setTheme(lightTheme);
        break;
      case "followOS":
        setTheme(prefersDarkMode ? darkTheme : lightTheme);
        break;
    }
    setLanguage(profile?.settings.language || "en")
  }, [profile])

  return (
    <ApplicationContext.Provider value={{ theme, toggleTheme, language, setLanguage, user, signOut, apiFetch, fetchAuthenticatedImage, profile, setProfile, isAdmin }}>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={language}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </LocalizationProvider>
    </ApplicationContext.Provider>
  );
};
import { Theme } from "@mui/material";
import { AxiosResponse } from "axios";
import { User } from "firebase/auth";
import { createContext } from "react";
import { Language } from "../../Types.js";

interface ApplicationContextType {
  // Define the properties of ApplicationContextType here
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
  user: User | null;
  signOut: () => Promise<void>;
  apiFetch: <T>(url: string, method: 'GET' | 'POST' | 'DELETE', body?: unknown, headers?: object) => Promise<AxiosResponse<T, unknown>>;
  fetchAuthenticatedImage: (url: string) => Promise<string>
}

export const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);


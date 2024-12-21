import { Theme } from "@mui/material";
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
}

export const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);


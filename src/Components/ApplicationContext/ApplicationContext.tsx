import { Theme } from "@mui/material";
import { AxiosResponse } from "axios";
import { User } from "firebase/auth";
import { createContext } from "react";
import { Language, UserProfile } from "../../Types.js";

export interface ConfirmDialogProps {
  title?: string;
  confirmText?: string;
  cancelText?: string;
}


interface ApplicationContextType {
  // Define the properties of ApplicationContextType here
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
  user: User | null;
  profile: UserProfile | null
  signOut: () => Promise<void>;
  apiFetch: <T>(url: string, method: 'GET' | 'POST' | 'DELETE', body?: unknown, headers?: object) => Promise<AxiosResponse<T, unknown>>;
  fetchAuthenticatedImage: (url: string) => Promise<string>
  setProfile: (profile: UserProfile) => void;
  isAdmin: boolean,
  confirm: (message: string, options?: ConfirmDialogProps) => Promise<boolean>;
  showError: (message: unknown) => Promise<void>;
  todaysRecipe: string;
  // Resolve profile display names for a set of Firebase UIDs. Caches results to avoid repeated network requests.
  getProfilesByUids: (uids: string[]) => Promise<Record<string, { uid: string; displayName?: string; email?: string }>>;
}

export const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);


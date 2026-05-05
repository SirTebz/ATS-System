import { create } from "zustand";
import type { AuthResponse } from "../types/index";

type UserInfo = {
    email: string;
    fullName: string;
    role: string;
    expiresAt: string;
};

type AuthState = {
    token: string | null;
    user: UserInfo | null;
    isAuthenticated: boolean;
    setAuth: (response: AuthResponse) => void;
    clearAuth: () => void;
};

const getStoredUser = (): UserInfo | null => {
    try {
        const stored = localStorage.getItem("ats_user");
        return stored ? (JSON.parse(stored) as UserInfo) : null;
    } catch {
        return null;
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem("ats_token"),
    user: getStoredUser(),
    isAuthenticated: !!localStorage.getItem("ats_token"),

    setAuth: (response: AuthResponse) => {
        const userInfo: UserInfo = {
            email: response.email,
            fullName: response.fullName,
            role: response.role,
            expiresAt: response.expiresAt,
        };
        localStorage.setItem("ats_token", response.token);
        localStorage.setItem("ats_user", JSON.stringify(userInfo));
        set({ token: response.token, user: userInfo, isAuthenticated: true });
    },

    clearAuth: () => {
        localStorage.removeItem("ats_token");
        localStorage.removeItem("ats_user");
        set({ token: null, user: null, isAuthenticated: false });
    },
}));
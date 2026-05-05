import { create } from "zustand";
import { AuthResponse } from "../types";

interface AuthState {
    token: string | null;
    user: Omit<AuthResponse, "token"> | null;
    isAuthenticated: boolean;
    setAuth: (response: AuthResponse) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem("ats_token"),
    user: (() => {
        const stored = localStorage.getItem("ats_user");
        return stored ? JSON.parse(stored) : null;
    })(),
    isAuthenticated: !!localStorage.getItem("ats_token"),

    setAuth: (response) => {
        localStorage.setItem("ats_token", response.token);
        localStorage.setItem(
            "ats_user",
            JSON.stringify({
                email: response.email,
                fullName: response.fullName,
                role: response.role,
                expiresAt: response.expiresAt,
            })
        );
        set({
            token: response.token,
            user: {
                email: response.email,
                fullName: response.fullName,
                role: response.role,
                expiresAt: response.expiresAt,
            },
            isAuthenticated: true,
        });
    },

    clearAuth: () => {
        localStorage.removeItem("ats_token");
        localStorage.removeItem("ats_user");
        set({ token: null, user: null, isAuthenticated: false });
    },
}));
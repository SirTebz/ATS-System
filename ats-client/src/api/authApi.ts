import apiClient from "./axios";
import type { AuthResponse, LoginDto, RegisterDto } from "../types/index";

export const authApi = {
    register: async (dto: RegisterDto): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>("/auth/register", dto);
        return data;
    },

    login: async (dto: LoginDto): Promise<AuthResponse> => {
        const { data } = await apiClient.post<AuthResponse>("/auth/login", dto);
        return data;
    },
};
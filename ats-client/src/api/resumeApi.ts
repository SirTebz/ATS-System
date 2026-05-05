import apiClient from "./axios";
import { Resume } from "../types";

export const resumeApi = {
    upload: async (file: File): Promise<Resume> => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await apiClient.post<Resume>("/resume/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    getMyResumes: async (): Promise<Resume[]> => {
        const { data } = await apiClient.get<Resume[]>("/resume/my");
        return data;
    },

    deleteResume: async (resumeId: string): Promise<void> => {
        await apiClient.delete(`/resume/${resumeId}`);
    },
};
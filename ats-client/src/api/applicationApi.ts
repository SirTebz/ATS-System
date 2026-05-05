import apiClient from "./axios";
import { Application, CreateApplicationDto } from "../types";

export const applicationApi = {
    apply: async (dto: CreateApplicationDto): Promise<Application> => {
        const { data } = await apiClient.post<Application>("/application", dto);
        return data;
    },

    getMyApplications: async (): Promise<Application[]> => {
        const { data } = await apiClient.get<Application[]>("/application/my");
        return data;
    },

    getJobApplications: async (jobId: string): Promise<Application[]> => {
        const { data } = await apiClient.get<Application[]>(
            `/application/job/${jobId}`
        );
        return data;
    },

    updateStatus: async (
        applicationId: string,
        status: string
    ): Promise<void> => {
        await apiClient.patch(
            `/application/${applicationId}/status?status=${status}`
        );
    },
};
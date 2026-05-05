import apiClient from "./axios";
import type { Job, CreateJobDto, UpdateJobDto } from "../types/index";

export const jobApi = {
    getAllJobs: async (): Promise<Job[]> => {
        const { data } = await apiClient.get<Job[]>("/job");
        return data;
    },

    getJobById: async (jobId: string): Promise<Job> => {
        const { data } = await apiClient.get<Job>(`/job/${jobId}`);
        return data;
    },

    getMyJobs: async (): Promise<Job[]> => {
        const { data } = await apiClient.get<Job[]>("/job/my");
        return data;
    },

    createJob: async (dto: CreateJobDto): Promise<Job> => {
        const { data } = await apiClient.post<Job>("/job", dto);
        return data;
    },

    updateJob: async (jobId: string, dto: UpdateJobDto): Promise<Job> => {
        const { data } = await apiClient.put<Job>(`/job/${jobId}`, dto);
        return data;
    },

    deleteJob: async (jobId: string): Promise<void> => {
        await apiClient.delete(`/job/${jobId}`);
    },

    toggleStatus: async (jobId: string): Promise<Job> => {
        const { data } = await apiClient.patch<Job>(`/job/${jobId}/toggle-status`);
        return data;
    },
};
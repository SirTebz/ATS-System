import apiClient from "./axios";
import { AnalysisResult } from "../types";

export const analysisApi = {
    getResult: async (applicationId: string): Promise<AnalysisResult> => {
        const { data } = await apiClient.get<AnalysisResult>(
            `/analysis/${applicationId}`
        );
        return data;
    },

    reanalyze: async (applicationId: string): Promise<AnalysisResult> => {
        const { data } = await apiClient.post<AnalysisResult>(
            `/analysis/${applicationId}/analyze`
        );
        return data;
    },
};
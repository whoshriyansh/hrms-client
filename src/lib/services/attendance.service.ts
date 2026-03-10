import { axiosInstance } from "@/lib/api/axiosInstance";
import { apiEndpoints } from "@/lib/api/apiEndpoints";
import type {
  MarkAttendanceRequest,
  MarkAttendanceResponse,
  GetAttendancesResponse,
  GetUserAttendancesResponse,
} from "@/lib/schemas/attendance.schema";

export interface GetAttendanceParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: "present" | "absent";
  search?: string;
  department?: string;
}

export interface GetUserAttendanceParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: "present" | "absent";
}

export const attendanceService = {
  getAll: async (
    params?: GetAttendanceParams,
  ): Promise<GetAttendancesResponse> => {
    const response = await axiosInstance.get<GetAttendancesResponse>(
      apiEndpoints.attendance.getAll,
      { params },
    );
    return response.data;
  },

  getByUserId: async (
    userId: string,
    params?: GetUserAttendanceParams,
  ): Promise<GetUserAttendancesResponse> => {
    const response = await axiosInstance.get<GetUserAttendancesResponse>(
      apiEndpoints.attendance.getByUserId(userId),
      { params },
    );
    return response.data;
  },

  mark: async (
    data: MarkAttendanceRequest,
  ): Promise<MarkAttendanceResponse> => {
    const response = await axiosInstance.post<MarkAttendanceResponse>(
      apiEndpoints.attendance.create,
      data,
    );
    return response.data;
  },

  update: async (
    id: string,
    data: { status: "present" | "absent"; date?: string },
  ) => {
    const response = await axiosInstance.put(
      apiEndpoints.attendance.update(id),
      data,
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(
      apiEndpoints.attendance.delete(id),
    );
    return response.data;
  },
};

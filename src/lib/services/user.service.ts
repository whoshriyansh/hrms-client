import { axiosInstance } from "@/lib/api/axiosInstance";
import { apiEndpoints } from "@/lib/api/apiEndpoints";
import type {
  CreateUserRequest,
  GetAllUsersResponse,
} from "@/lib/schemas/user.schema";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}

export const userService = {
  getAll: async (params?: GetUsersParams): Promise<GetAllUsersResponse> => {
    const response = await axiosInstance.get<GetAllUsersResponse>(
      apiEndpoints.user.getAll,
      { params },
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(apiEndpoints.user.getById(id));
    return response.data;
  },

  create: async (data: CreateUserRequest) => {
    const response = await axiosInstance.post(apiEndpoints.user.create, data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateUserRequest>) => {
    const response = await axiosInstance.put(
      apiEndpoints.user.update(id),
      data,
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(apiEndpoints.user.delete(id));
    return response.data;
  },
};

export const apiEndpoints = {
  user: {
    getAll: "/api/users",
    getById: (id: string) => `/api/users/${id}`,
    create: "/api/users",
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
  },
  auth: {
    login: "/api/auth/login",
  },
  attendance: {
    getAll: "/api/attendance",
    getByUserId: (id: string) => `/api/attendance/user/${id}`,
    create: "/api/attendance",
    update: (id: string) => `/api/attendance/${id}`,
    delete: (id: string) => `/api/attendance/${id}`,
  },
};

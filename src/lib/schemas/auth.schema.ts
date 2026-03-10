import z from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

/**
 * {
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "_id": "69af3601151c12bc7ecaef3c",
            "fullName": "Admin User",
            "email": "admin@example.com",
            "employeeId": "ADMIN001",
            "department": "HR",
            "password": "$2b$10$CIK9azsl80rfZBvMQhp7xuV65o3wuRowTBEKBRBUV0.Xi.AGl06Iy",
            "role": "admin",
            "createdAt": "2026-03-09T21:05:05.465Z",
            "updatedAt": "2026-03-09T21:05:05.465Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YWYzNjAxMTUxYzEyYmM3ZWNhZWYzYyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MzA5MDM3NiwiZXhwIjoxNzczNjk1MTc2fQ.D5zYOVgM37LbEcJT4pvxJ7TvX-vJ5qsgbzUHn3Jdsr4"
    }
}
 */

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: z.object({
      _id: z.string(),
      fullName: z.string(),
      email: z.string().email(),
      employeeId: z.string(),
      department: z.string(),
      password: z.string(),
      role: z.enum(["admin", "employee"]),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
    token: z.string(),
  }),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

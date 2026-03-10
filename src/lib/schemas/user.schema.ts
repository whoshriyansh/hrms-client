import z from "zod";

export const DEPARTMENTS = [
  "HR",
  "Engineering",
  "Sales",
  "Marketing",
  "Finance",
  "Support",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const CreateUserRequestSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  department: z.enum(DEPARTMENTS, {
    message:
      "Department must be one of HR, Engineering, Sales, Marketing, Finance, Support",
  }),
});

/**
 * {
    "success": true,
    "message": "User created successfully",
    "data": {
        "fullName": "varun shukla",
        "email": "varuun@example.com",
        "employeeId": "EMP2425",
        "department": "Marketing",
        "role": "employee",
        "_id": "69afa3ef38f6a033556e557d",
        "createdAt": "2026-03-10T04:54:07.841Z",
        "updatedAt": "2026-03-10T04:54:07.841Z"
    }
}
 */

export const CreateUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: z.object({
      fullName: z.string(),
      email: z.string().email(),
      employeeId: z.string(),
      department: z.enum(DEPARTMENTS),
      role: z.enum(["admin", "employee"]),
      _id: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  }),
});

/**
 * {
    "success": true,
    "message": "Users retrieved successfully",
    "data": {
        "users": [
            {
                "_id": "69afa2db95f104aa38138edf",
                "fullName": "jason wob",
                "email": "jason@example.com",
                "employeeId": "EMP6014",
                "department": "HR",
                "role": "employee",
                "createdAt": "2026-03-10T04:49:31.091Z",
                "updatedAt": "2026-03-10T04:49:31.091Z"
            },
            {
                "_id": "69afa39a38f6a033556e5574",
                "fullName": "shriyansh lohia",
                "email": "shriyansh@example.com",
                "employeeId": "EMP6612",
                "department": "HR",
                "role": "employee",
                "createdAt": "2026-03-10T04:52:42.949Z",
                "updatedAt": "2026-03-10T04:52:42.949Z"
            }
        ],
        "pagination": {
            "currentPage": 1,
            "limit": 10,
            "totalUsers": 2,
            "totalPages": 1,
            "hasNextPage": false,
            "hasPrevPage": false
        }
    }
}
 */

export const GetAllUsersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    users: z.array(
      z.object({
        _id: z.string(),
        fullName: z.string(),
        email: z.string().email(),
        employeeId: z.string(),
        department: z.enum(DEPARTMENTS),
        role: z.enum(["admin", "employee"]),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
    ),
    pagination: z.object({
      currentPage: z.number(),
      limit: z.number(),
      totalUsers: z.number(),
      totalPages: z.number(),
      hasNextPage: z.boolean(),
      hasPrevPage: z.boolean(),
    }),
  }),
});

/**
 * {
    "success": true,
    "message": "User retrieved successfully",
    "data": {
        "_id": "69afa2db95f104aa38138edf",
        "fullName": "jason wob",
        "email": "jason@example.com",
        "employeeId": "EMP6014",
        "department": "HR",
        "role": "employee",
        "createdAt": "2026-03-10T04:49:31.091Z",
        "updatedAt": "2026-03-10T04:49:31.091Z"
    }
}
 */

export const GetSingleUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    _id: z.string(),
    fullName: z.string(),
    email: z.string().email(),
    employeeId: z.string(),
    department: z.enum(DEPARTMENTS),
    role: z.enum(["admin", "employee"]),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type GetAllUsersResponse = z.infer<typeof GetAllUsersResponseSchema>;

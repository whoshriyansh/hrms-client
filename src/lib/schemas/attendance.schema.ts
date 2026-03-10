import z from "zod";

export const MarkAttendanceRequestSchema = z.object({
  userId: z.string(),
  date: z.string().optional(), // ISO date string
  status: z.enum(["present", "absent"]),
});

export const MarkAttendanceResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    userId: z.string(),
    date: z.string(),
    status: z.enum(["present", "absent"]),
    _id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export const GetAttendancesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    attendances: z.array(
      z.object({
        _id: z.string(),
        userId: z.string(),
        date: z.string(),
        status: z.enum(["present", "absent"]),
        createdAt: z.string(),
        updatedAt: z.string(),
        user: z.object({
          fullName: z.string(),
          email: z.string().email(),
          employeeId: z.string(),
          department: z.enum(["HR", "Engineering", "Sales", "Marketing"]),
        }),
      }),
    ),
    pagination: z.object({
      currentPage: z.number(),
      limit: z.number(),
      totalAttendances: z.number(),
      totalPages: z.number(),
      hasNextPage: z.boolean(),
      hasPrevPage: z.boolean(),
    }),
  }),
});

export const GetUserAttendancesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    attendances: z.array(
      z.object({
        _id: z.string(),
        userId: z.object({
          _id: z.string(),
          fullName: z.string(),
          email: z.string().email(),
          employeeId: z.string(),
          department: z.enum(["HR", "Engineering", "Sales", "Marketing"]),
        }),
        date: z.string(),
        status: z.enum(["present", "absent"]),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
    ),
    pagination: z.object({
      currentPage: z.number(),
      limit: z.number(),
      totalAttendances: z.number(),
      totalPages: z.number(),
      hasNextPage: z.boolean(),
      hasPrevPage: z.boolean(),
    }),
  }),
});

export type MarkAttendanceRequest = z.infer<typeof MarkAttendanceRequestSchema>;
export type MarkAttendanceResponse = z.infer<
  typeof MarkAttendanceResponseSchema
>;
export type GetAttendancesResponse = z.infer<
  typeof GetAttendancesResponseSchema
>;
export type GetUserAttendancesResponse = z.infer<
  typeof GetUserAttendancesResponseSchema
>;

import { z } from "zod";

export const CreateMeetingSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  startTime: z.string().optional(),
  duration: z.number().optional(),
});
export type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>;

export const JoinMeetingSchema = z.object({
  meetingId: z.string(),
  displayName: z.string().min(1, "Display name is required"),
});
export type JoinMeetingInput = z.infer<typeof JoinMeetingSchema>;

export const GetSignatureSchema = z.object({
  meetingNumber: z.string(),
  role: z.number().int().min(0).max(1),
});
export type GetSignatureInput = z.infer<typeof GetSignatureSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const ListMeetingsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});
export type ListMeetingsInput = z.infer<typeof ListMeetingsSchema>;

export const GetMeetingByIdSchema = z.object({
  id: z.string(),
});
export type GetMeetingByIdInput = z.infer<typeof GetMeetingByIdSchema>;

export const DeleteMeetingSchema = z.object({
  id: z.string(),
});
export type DeleteMeetingInput = z.infer<typeof DeleteMeetingSchema>;

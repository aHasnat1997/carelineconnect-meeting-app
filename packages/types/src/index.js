import { z } from "zod";
export const CreateMeetingSchema = z.object({
    topic: z.string().min(1, "Topic is required"),
    startTime: z.string().optional(),
    duration: z.number().optional(),
});
export const JoinMeetingSchema = z.object({
    meetingId: z.string(),
    displayName: z.string().min(1, "Display name is required"),
});
export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
});

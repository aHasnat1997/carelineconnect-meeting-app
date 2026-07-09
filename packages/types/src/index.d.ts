import { z } from "zod";
export declare const CreateMeetingSchema: z.ZodObject<{
    topic: z.ZodString;
    startTime: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    topic: string;
    startTime?: string | undefined;
    duration?: number | undefined;
}, {
    topic: string;
    startTime?: string | undefined;
    duration?: number | undefined;
}>;
export type CreateMeetingInput = z.infer<typeof CreateMeetingSchema>;
export declare const JoinMeetingSchema: z.ZodObject<{
    meetingId: z.ZodString;
    displayName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    meetingId: string;
    displayName: string;
}, {
    meetingId: string;
    displayName: string;
}>;
export type JoinMeetingInput = z.infer<typeof JoinMeetingSchema>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    name?: string | undefined;
}, {
    id: string;
    email: string;
    name?: string | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
//# sourceMappingURL=index.d.ts.map
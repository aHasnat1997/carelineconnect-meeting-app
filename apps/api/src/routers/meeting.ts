import { router, publicProcedure } from "../trpc";
import { CreateMeetingSchema, JoinMeetingSchema, GetSignatureSchema, ListMeetingsSchema, GetMeetingByIdSchema, DeleteMeetingSchema } from "@repo/types";
import jwt from "jsonwebtoken";

async function getZoomAccessToken(): Promise<string> {
  const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } = process.env;
  const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    { method: "POST", headers: { Authorization: `Basic ${credentials}` } }
  );
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export const meetingRouter = router({
  create: publicProcedure
    .input(CreateMeetingSchema)
    .mutation(async ({ input, ctx }) => {
      const token = await getZoomAccessToken();

      const zoomRes = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: input.topic,
          type: input.startTime ? 2 : 1,
          start_time: input.startTime,
          duration: input.duration ?? 30,
        }),
      });

      const zoomMeeting = await zoomRes.json() as { id: number; join_url: string };

      if (!zoomMeeting.join_url) {
        throw new Error(`Zoom API error: ${JSON.stringify(zoomMeeting)}`);
      }

      let host = await ctx.prisma.host.findFirst();
      if (!host) {
        host = await ctx.prisma.host.create({
          data: { email: "test@carelineconnect.com", name: "Test Host" },
        });
      }

      return ctx.prisma.meeting.create({
        data: {
          zoomId: String(zoomMeeting.id),
          topic: input.topic,
          joinUrl: zoomMeeting.join_url,
          hostId: host.id,
        },
      });
    }),

  getById: publicProcedure
    .input(JoinMeetingSchema)
    .query(async ({ input, ctx }) => {
      const meeting = await ctx.prisma.meeting.findUnique({
        where: { id: input.meetingId },
      });
      if (!meeting) throw new Error("Meeting not found");
      return meeting;
    }),

  getSignature: publicProcedure
    .input(GetSignatureSchema)
    .mutation(({ input }) => {
      const { ZOOM_SDK_KEY, ZOOM_SDK_SECRET } = process.env;
      if (!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) throw new Error("Zoom SDK credentials not configured");
      const iat = Math.round(Date.now() / 1000) - 30;
      const exp = iat + 60 * 60 * 2;
      const signature = jwt.sign(
        { appKey: ZOOM_SDK_KEY, mn: input.meetingNumber, role: input.role, iat, exp, tokenExp: exp },
        ZOOM_SDK_SECRET,
        { header: { alg: "HS256", typ: "JWT" } }
      );
      return { signature, sdkKey: ZOOM_SDK_KEY };
    }),

  list: publicProcedure
    .input(ListMeetingsSchema)
    .query(async ({ input, ctx }) => {
      const [meetings, total] = await Promise.all([
        ctx.prisma.meeting.findMany({
          orderBy: { createdAt: "desc" },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        }),
        ctx.prisma.meeting.count(),
      ]);
      return { meetings, total, page: input.page, limit: input.limit };
    }),

  getByDbId: publicProcedure
    .input(GetMeetingByIdSchema)
    .query(async ({ input, ctx }) => {
      const meeting = await ctx.prisma.meeting.findUnique({
        where: { id: input.id },
      });
      if (!meeting) throw new Error("Meeting not found");
      return meeting;
    }),

  delete: publicProcedure
    .input(DeleteMeetingSchema)
    .mutation(async ({ input, ctx }) => {
      const meeting = await ctx.prisma.meeting.findUnique({
        where: { id: input.id },
      });
      if (!meeting) throw new Error("Meeting not found");
      await ctx.prisma.meeting.delete({ where: { id: input.id } });
      return { success: true, id: input.id };
    }),
});


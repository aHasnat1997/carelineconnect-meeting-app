import { router, publicProcedure } from "../trpc";
import { CreateMeetingSchema, JoinMeetingSchema } from "@repo/types";

export const meetingRouter = router({
  create: publicProcedure
    .input(CreateMeetingSchema)
    .mutation(async ({ input, ctx }) => {
      // Simulate Zoom API call
      const zoomId = `zoom-${Math.random().toString(36).substring(7)}`;
      const joinUrl = `https://zoom.us/j/${zoomId}`;

      // We should ideally have a host. Let's create a dummy one for now if none exists.
      let host = await ctx.prisma.host.findFirst();
      if (!host) {
        host = await ctx.prisma.host.create({
          data: { email: "test@carelineconnect.com", name: "Test Host" },
        });
      }

      const meeting = await ctx.prisma.meeting.create({
        data: {
          zoomId,
          topic: input.topic,
          joinUrl,
          hostId: host.id,
        },
      });
      return meeting;
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
});

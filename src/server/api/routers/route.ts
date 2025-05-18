import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const routeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        origin: z.string(),
        destination: z.string(),
        directions: z.object({}).passthrough(), // Accept any JSON object structure
        dateTime: z.date().optional(),
        seats: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.route.create({
        data: {
          origin: input.origin,
          destination: input.destination,
          directions: input.directions,
          dateTime: input.dateTime,
          seats: input.seats,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.route.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.route.findUnique({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.route.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
});

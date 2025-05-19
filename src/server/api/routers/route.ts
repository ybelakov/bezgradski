import { z } from "zod";
import { type Route, type Prisma, UserRideStatus } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Define a Zod schema for the directions object
const legSchema = z
  .object({
    start_location: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .passthrough(),
    end_location: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .passthrough(),
  })
  .passthrough();

const routeSchema = z
  .object({
    legs: z.array(legSchema),
  })
  .passthrough();

const directionsSchema = z
  .object({
    routes: z.array(routeSchema),
  })
  .passthrough();

export const routeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        origin: z.string(),
        destination: z.string(),
        directions: z.any(), // Reverted to z.any() for input to Prisma
        dateTime: z.date(),
        seats: z.number().int().optional(),
        phoneNumber: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let originLat: number | undefined;
      let originLng: number | undefined;
      let destinationLat: number | undefined;
      let destinationLng: number | undefined;

      try {
        await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { phoneNumber: input.phoneNumber },
        });
        // Parse input.directions using our more specific schema for safe access
        const parsedDirections = directionsSchema.safeParse(input.directions);

        if (parsedDirections.success) {
          const firstRoute = parsedDirections.data.routes[0];
          if (firstRoute?.legs?.[0]) {
            const firstLeg = firstRoute.legs[0];
            originLat = firstLeg.start_location.lat;
            originLng = firstLeg.start_location.lng;
            destinationLat = firstLeg.end_location.lat;
            destinationLng = firstLeg.end_location.lng;
          }
        } else {
          console.error("Failed to parse directions:", parsedDirections.error);
          // Optionally handle the error, e.g., by not setting coordinates
        }
      } catch (error) {
        console.error("Error extracting coordinates from directions:", error);
      }

      return ctx.db.route.create({
        data: {
          origin: input.origin,
          destination: input.destination,
          directions: input.directions as Prisma.InputJsonValue,
          dateTime: input.dateTime,
          seats: input.seats,
          originLat,
          originLng,
          destinationLat,
          destinationLng,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  getAllUpcoming: protectedProcedure
    .input(
      z
        .object({
          date: z.date().optional(),
          limit: z.number().min(1).max(100).default(10),
          cursor: z
            .object({
              id: z.string(),
              dateTime: z.date(),
            })
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = input?.date ?? now;

      if (input?.date && input?.date?.getTime() >= now.getTime()) {
        startDate.setHours(0, 0, 0, 0);
      }

      const endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);

      const limit = input?.limit ?? 10;
      const cursor = input?.cursor;

      const items = await ctx.db.route.findMany({
        take: limit + 1,
        where: {
          AND: [
            {
              dateTime: input?.date
                ? {
                    gte: startDate,
                    lte: endDate,
                  }
                : {
                    gte: now,
                  },
            },
            {
              status: "ACTIVE",
            },
            cursor
              ? {
                  OR: [
                    {
                      dateTime: {
                        gt: cursor.dateTime,
                      },
                    },
                    {
                      AND: [
                        { dateTime: cursor.dateTime },
                        { id: { gt: cursor.id } },
                      ],
                    },
                  ],
                }
              : {},
          ],
        },
        orderBy: [{ dateTime: "asc" }, { id: "asc" }],
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = {
          id: nextItem!.id,
          dateTime: nextItem!.dateTime,
        };
      }

      return {
        items,
        nextCursor,
      };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.route.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        user: true,
        _count: {
          select: {
            userRides: { where: { status: "ACTIVE" } },
          },
        },
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
        },
        include: {
          user: true,
          _count: {
            select: {
              userRides: { where: { status: "ACTIVE" } },
            },
          },
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

  // New procedure for searching routes
  search: protectedProcedure // Or publicProcedure if search is for everyone
    .input(
      z.object({
        originLat: z.number(),
        originLng: z.number(),
        originAddress: z.string().optional(), // Not used in DB query directly, but good to have
        destinationLat: z.number(),
        destinationLng: z.number(),
        destinationAddress: z.string().optional(), // Same as originAddress
        date: z.string(), // Expected format: "YYYY-MM-DD"
        originSearchRadiusKm: z.number().optional().default(2),
        destinationSearchRadiusKm: z.number().optional().default(2),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        originLat,
        originLng,
        destinationLat,
        destinationLng,
        date,
        originSearchRadiusKm,
        destinationSearchRadiusKm,
      } = input;

      const earthRadiusKm = 6371;

      // Start of the day in UTC
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);

      // End of the day in UTC
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);

      // Query by date only
      const routes: Route[] = await ctx.db.$queryRaw`
        SELECT * FROM "Route"
        WHERE 
          "dateTime" >= ${startDate} AND "dateTime" <= ${endDate}
          AND (
            ${earthRadiusKm} * acos(
              cos(radians(${originLat})) * cos(radians("originLat")) *
              cos(radians("originLng") - radians(${originLng})) +
              sin(radians(${originLat})) * sin(radians("originLat"))
            )
          ) <= ${originSearchRadiusKm}
          AND (
            ${earthRadiusKm} * acos(
              cos(radians(${destinationLat})) * cos(radians("destinationLat")) *
              cos(radians("destinationLng") - radians(${destinationLng})) +
              sin(radians(${destinationLat})) * sin(radians("destinationLat"))
            )
          ) <= ${destinationSearchRadiusKm}
        ORDER BY "dateTime" ASC;
      `;

      return routes;
    }),

  cancelRoute: protectedProcedure
    .input(
      z.object({
        routeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First verify the user owns this route
      const route = await ctx.db.route.findUnique({
        where: { id: input.routeId },
        include: { userRides: true },
      });

      if (!route) {
        throw new Error("Route not found");
      }

      if (route.userId !== ctx.session.user.id) {
        throw new Error("Not authorized to cancel this route");
      }

      // Update the route status to cancelled
      const updatedRoute = await ctx.db.route.update({
        where: { id: input.routeId },
        data: {
          status: UserRideStatus.CANCELLED,
          // Also cancel all associated userRides
          userRides: {
            updateMany: {
              where: { routeId: input.routeId },
              data: { status: UserRideStatus.CANCELLED },
            },
          },
        },
        include: { userRides: true },
      });

      return updatedRoute;
    }),
});

import { z } from "zod";
import { type Route, type Prisma } from "@prisma/client";

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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let originLat: number | undefined;
      let originLng: number | undefined;
      let destinationLat: number | undefined;
      let destinationLng: number | undefined;

      try {
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
  getAllUpcoming: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.route.findMany({
      where: {
        dateTime: {
          gte: new Date(),
        },
      },
      include: {
        _count: {
          select: {
            userRides: { where: { status: "ACTIVE" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
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

      // Fetch the count of active rides for each route
      const routesWithAvailableSeats = await Promise.all(
        routes.map(async (route) => {
          const activeRides = await ctx.db.userRide.count({
            where: {
              routeId: route.id,
              status: "ACTIVE",
            },
          });

          return {
            ...route,
            activeRidesCount: activeRides,
            availableSeats: route.seats ? route.seats - activeRides : null,
          };
        }),
      );

      return routesWithAvailableSeats;
    }),
});

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";
import { getTranslations } from "next-intl/server";
// import { UserRideStatus } from "@prisma/client"; // Import the enum - no longer needed

export const userRideRouter = createTRPCRouter({
  signUp: protectedProcedure
    .input(
      z.object({
        routeId: z.string().cuid(),
        phoneNumber: z.string().min(1, "Phone number is required.").optional(), // Optional for now, can be prefilled
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const t = await getTranslations();

      // 1. Fetch Route details
      const route = await db.route.findUnique({
        where: { id: input.routeId },
        include: {
          user: true, // To check if the user is the creator
          userRides: {
            where: { status: "ACTIVE" }, // Use string literal for UserRideStatus.ACTIVE
          },
        },
      });

      if (!route) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: t("route_not_found"),
        });
      }

      // 2. Perform checks
      if (route.userId === userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: t("cannot_sign_up_for_own_route"),
        });
      }

      if (new Date(route.dateTime) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: t("this_route_is_in_the_past"),
        });
      }

      const existingSignUp = await db.userRide.findUnique({
        where: {
          userId_routeId: {
            userId: userId,
            routeId: input.routeId,
          },
        },
      });

      if (existingSignUp) {
        if (existingSignUp.status === "ACTIVE") {
          // Use string literal
          throw new TRPCError({
            code: "CONFLICT",
            message: t("already_signed_up_for_route"),
          });
        } else if (existingSignUp.status === "CANCELLED") {
          // Use string literal
          // If cancelled, allow re-sign up by updating status (or creating new, simpler for now to update)
          // For now, let's throw an error and handle re-activation/new sign up later if needed
          throw new TRPCError({
            code: "CONFLICT",
            message: t("already_cancelled_for_route_contact_service"),
          });
        }
      }

      const availableSeats = (route.seats ?? 0) - route.userRides.length;
      if (availableSeats <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: t("no_seats_available_for_route"),
        });
      }

      // 3. Update user's phone number if provided and different
      if (
        input.phoneNumber &&
        ctx.session.user.phoneNumber !== input.phoneNumber
      ) {
        await db.user.update({
          where: { id: userId },
          data: { phoneNumber: input.phoneNumber },
        });
        // Optionally, update the session user object too, though next-auth might handle this
        // ctx.session.user.phoneNumber = input.phoneNumber;
      }

      // 4. Create UserRide record
      const newUserRide = await db.userRide.create({
        data: {
          userId: userId,
          routeId: input.routeId,
          status: "ACTIVE", // Use string literal for UserRideStatus.ACTIVE
        },
      });

      return {
        success: true,
        userRideId: newUserRide.id,
        message: t("successfully_signed_up_for_route"),
      };
    }),

  getRideStatusForRoute: protectedProcedure
    .input(z.object({ routeId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRide = await db.userRide.findUnique({
        where: {
          userId_routeId: {
            userId: userId,
            routeId: input.routeId,
          },
        },
        select: {
          status: true,
        },
      });
      return userRide; // Will be null if not found, or { status: 'ACTIVE'/'CANCELLED' }
    }),

  // Get all routes where the user is a passenger (not the driver)
  getMyRidesAsPassenger: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return db.userRide.findMany({
      where: {
        userId: userId,
        status: "ACTIVE",
      },
      include: {
        route: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        route: {
          dateTime: "asc",
        },
      },
    });
  }),

  // Get all passengers for a specific route
  getPassengersForRoute: protectedProcedure
    .input(z.object({ routeId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const t = await getTranslations();
      const route = await db.route.findUnique({
        where: {
          id: input.routeId,
        },
        select: {
          userId: true,
        },
      });

      if (!route) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: t("route_not_found"),
        });
      }

      // Only the route owner should be able to see passengers
      if (route.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: t("only_route_owner_can_view_passengers"),
        });
      }

      return db.userRide.findMany({
        where: {
          routeId: input.routeId,
          status: "ACTIVE",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              image: true,
            },
          },
        },
      });
    }),

  // TODO: Add a mutation to cancel a UserRide (setStatus to CANCELLED)
  // TODO: Add a query to get UserRide status for a specific route & user

  cancelRide: protectedProcedure
    .input(z.object({ routeId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const t = await getTranslations();

      // Find the user ride
      const userRide = await db.userRide.findUnique({
        where: {
          userId_routeId: {
            userId: userId,
            routeId: input.routeId,
          },
        },
        include: {
          route: true,
        },
      });

      // Check if the ride exists and is active
      if (!userRide) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: t("not_signed_up_for_route"),
        });
      }

      if (userRide.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: t("already_cancelled_for_route"),
        });
      }

      // Check if the ride is in the past
      if (new Date(userRide.route.dateTime) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: t("cannot_cancel_past_route"),
        });
      }

      await db.userRide.delete({
        where: {
          userId_routeId: {
            userId,
            routeId: input.routeId,
          },
        },
      });

      return {
        success: true,
        message: t("successfully_cancelled_ride"),
      };
    }),
});

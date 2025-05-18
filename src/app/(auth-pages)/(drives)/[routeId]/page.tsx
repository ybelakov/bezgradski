"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
// No longer need useEffect from react for this page's direct logic
// import { useEffect } from "react";
import { RouteDisplayMap } from "~/app/_components/RouteDisplayMap"; // Import the new map component
import { useState } from "react"; // For modal state

// Define a simple modal component (can be moved to a separate file later)
// For now, keeping it in the same file for brevity.
// You'll likely want to use a proper modal component from a UI library (e.g., Shadcn UI Dialog)
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phoneNumber: string) => void;
  initialPhoneNumber: string;
  isLoading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialPhoneNumber,
  isLoading,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold">Потвърдете записването</h2>
        <p className="mb-4">
          Моля, въведете или потвърдете телефонния си номер:
        </p>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Телефонен номер"
          className="mb-4 w-full rounded border p-2"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 disabled:opacity-50"
          >
            Отказ
          </button>
          <button
            onClick={() => onConfirm(phoneNumber)}
            disabled={isLoading || !phoneNumber.trim()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "Записване..." : "Потвърди"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RouteDetailsPage() {
  const params = useParams();
  const routeId = params.routeId as string;
  const { data: session } = useSession(); // Get session data
  const utils = api.useUtils(); // For invalidating queries

  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: route,
    isLoading: isLoadingRoute,
    isError: isRouteError,
    error: routeError,
  } = api.routes.getById.useQuery(
    { id: routeId },
    {
      enabled: !!routeId,
    },
  );

  const { data: userRideStatus, isLoading: isLoadingUserRideStatus } =
    api.userRide.getRideStatusForRoute.useQuery(
      { routeId },
      {
        enabled: !!routeId && !!session?.user, // Only run if routeId and user session exist
      },
    );

  const signUpMutation = api.userRide.signUp.useMutation({
    onSuccess: async () => {
      setIsModalOpen(false);
      // Invalidate queries to refetch data and update UI
      await utils.routes.getById.invalidate({ id: routeId });
      await utils.userRide.getRideStatusForRoute.invalidate({ routeId });
    },
    onError: () => {
      setIsModalOpen(false);
    },
  });

  const cancelRideMutation = api.userRide.cancelRide.useMutation({
    onSuccess: async () => {
      // Invalidate queries to refetch data and update UI
      await utils.routes.getById.invalidate({ id: routeId });
      await utils.userRide.getRideStatusForRoute.invalidate({ routeId });
    },
  });

  if (isLoadingRoute || (session && isLoadingUserRideStatus)) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }

  if (isRouteError) return <p>Error fetching route: {routeError?.message}</p>;
  if (!route) return <p>Route not found.</p>;

  // Calculate available seats
  const totalSeats = route.seats ?? 0;
  const bookedSeats = route._count?.userRides ?? 0; // From the updated getById query
  const availableSeats = totalSeats - bookedSeats;

  // Conditions for showing the sign-up button
  const isRouteInPast = new Date(route.dateTime) < new Date();
  const isUserCreator = session?.user?.id === route.userId;
  const isActiveUserRide = userRideStatus?.status === "ACTIVE";
  // For now, don't allow sign up if previously cancelled. Can be changed later.
  const wasRideCancelledByUser = userRideStatus?.status === "CANCELLED";

  const canSignUp =
    session?.user &&
    !isRouteInPast &&
    !isUserCreator &&
    availableSeats > 0 &&
    !isActiveUserRide &&
    !wasRideCancelledByUser;

  const handleSignUpClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmSignUp = (phoneNumber: string) => {
    if (!phoneNumber.trim()) {
      return;
    }
    signUpMutation.mutate({ routeId, phoneNumber });
  };

  return (
    <div className="container mx-auto p-4 pt-12">
      <h1 className="mb-4 text-2xl font-bold">Информация за маршрута</h1>
      <div className="mb-6 rounded bg-gray-100 p-4 shadow">
        <p>
          <strong>Шофьор:</strong>{" "}
          {route.user?.name ?? route.user?.email ?? "N/A"}
        </p>
        {route.user?.phoneNumber ? (
          <p>
            <strong>Тел за връзка:</strong> {route.user?.phoneNumber ?? ""}
          </p>
        ) : null}
        <p>
          <strong>Начална точка:</strong> {route.origin}
        </p>
        <p>
          <strong>Дестинация:</strong> {route.destination}
        </p>
        <p>
          <strong>Дата:</strong>{" "}
          {route.dateTime
            ? new Date(route.dateTime).toLocaleDateString()
            : "N/A"}
        </p>
        <p>
          <strong>Час:</strong>{" "}
          {route.dateTime
            ? new Date(route.dateTime).toLocaleTimeString()
            : "N/A"}
        </p>
        <p>
          <strong>Общо места:</strong> {totalSeats}
        </p>
        <p>
          <strong>Свободни места:</strong>{" "}
          {availableSeats > 0 ? availableSeats : "Няма свободни места"}
        </p>
        {isUserCreator && (
          <p className="text-sm text-green-600">Това е ваш маршрут.</p>
        )}
        {isActiveUserRide && (
          <p className="text-sm text-blue-600">
            Вече сте записани за този маршрут.
          </p>
        )}
        {wasRideCancelledByUser && (
          <p className="text-sm text-orange-600">
            Отказали сте се от този маршрут.
          </p>
        )}
        {isRouteInPast && (
          <p className="text-sm text-red-600">Този маршрут е в миналото.</p>
        )}
      </div>

      {/* Sign-up Button */}
      {canSignUp && (
        <button
          onClick={handleSignUpClick}
          className="mb-6 rounded bg-green-500 px-6 py-2 text-white hover:bg-green-600 disabled:opacity-50"
          disabled={signUpMutation.isPending}
        >
          Запиши се за пътуването
        </button>
      )}

      {/* Cancel Registration Button */}
      {isActiveUserRide && !isRouteInPast && (
        <button
          onClick={() => {
            if (
              confirm(
                "Сигурни ли сте, че искате да откажете записването си за този маршрут?",
              )
            ) {
              cancelRideMutation.mutate({ routeId });
            }
          }}
          className="mb-6 ml-2 rounded bg-red-500 px-6 py-2 text-white hover:bg-red-600 disabled:opacity-50"
          disabled={cancelRideMutation.isPending}
        >
          {cancelRideMutation.isPending ? "Отказване..." : "Откажи записването"}
        </button>
      )}

      {/* Map Display Section */}
      <div className="mt-6">
        <RouteDisplayMap
          directions={
            route.directions as object as google.maps.DirectionsResult // Type assertion might need review
          }
        />
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSignUp}
        initialPhoneNumber={session?.user?.phoneNumber ?? ""}
        isLoading={signUpMutation.isPending}
      />
    </div>
  );
}

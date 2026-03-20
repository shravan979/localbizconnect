import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../components/Shared/Navbar";

type Booking = {
  _id: string;
  status: "pending" | "accepted" | "rejected" | string;
  createdAt?: string;
  serviceTitle?: string;
  description?: string;
  preferredDate?: string;
  urgency?: "low" | "medium" | "high" | string;
  customerId?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/booking/provider`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBookings(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const updateBookingStatus = async (
    bookingId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setActionLoading(bookingId);
      setError("");
      setMessage("");

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/booking/${bookingId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId ? { ...booking, status } : booking
        )
      );

      setMessage(
        status === "accepted"
          ? "Booking accepted successfully"
          : "Booking rejected successfully"
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update booking");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "pending"),
    [bookings]
  );

  const acceptedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "accepted"),
    [bookings]
  );

  const rejectedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "rejected"),
    [bookings]
  );

  const getStatusClasses = (status: string) => {
    if (status === "accepted") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  const getUrgencyClasses = (urgency?: string) => {
    if (urgency === "high") return "bg-red-100 text-red-700";
    if (urgency === "low") return "bg-slate-100 text-slate-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {booking.customerId?.name || "Unknown Customer"}
          </h3>

          <div className="mt-3 space-y-1 text-sm text-slate-600">
            <p>📧 Email: {booking.customerId?.email || "N/A"}</p>
            <p>📞 Phone: {booking.customerId?.phone || "N/A"}</p>
            <p>📌 Service: {booking.serviceTitle || "N/A"}</p>
            <p>📝 Description: {booking.description || "N/A"}</p>

            {booking.preferredDate && (
              <p>
                📅 Preferred:{" "}
                {new Date(booking.preferredDate).toLocaleString()}
              </p>
            )}

            <p>🆔 Booking ID: {booking._id}</p>

            {booking.createdAt && (
              <p className="text-slate-500">
                Requested on:{" "}
                {new Date(booking.createdAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="mt-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getUrgencyClasses(
                booking.urgency
              )}`}
            >
              {booking.urgency || "medium"} urgency
            </span>
          </div>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
            booking.status
          )}`}
        >
          {booking.status}
        </span>
      </div>

      {booking.status === "pending" ? (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => updateBookingStatus(booking._id, "accepted")}
            disabled={actionLoading === booking._id}
            className="rounded-xl bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {actionLoading === booking._id ? "Updating..." : "Accept"}
          </button>

          <button
            onClick={() => updateBookingStatus(booking._id, "rejected")}
            disabled={actionLoading === booking._id}
            className="rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {actionLoading === booking._id ? "Updating..." : "Reject"}
          </button>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-sm font-medium text-slate-500">
            This booking decision is final.
          </p>
        </div>
      )}
    </div>
  );

  const EmptyState = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle: string;
  }) => (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-6">
        <Navbar title="Provider Dashboard" />

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {pendingBookings.length}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Awaiting your action</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Accepted</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {acceptedBookings.length}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Confirmed service requests
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Rejected</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {rejectedBookings.length}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Declined requests</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-600">Loading bookings...</p>
        ) : (
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Pending Bookings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review and respond to new requests
                </p>
              </div>

              <div className="grid gap-4">
                {pendingBookings.length > 0 ? (
                  pendingBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))
                ) : (
                  <EmptyState
                    title="No pending bookings"
                    subtitle="New booking requests will appear here."
                  />
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Accepted Bookings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  These requests have been approved
                </p>
              </div>

              <div className="grid gap-4">
                {acceptedBookings.length > 0 ? (
                  acceptedBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))
                ) : (
                  <EmptyState
                    title="No accepted bookings"
                    subtitle="Accepted requests will appear here."
                  />
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Rejected Bookings
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  These requests were declined
                </p>
              </div>

              <div className="grid gap-4">
                {rejectedBookings.length > 0 ? (
                  rejectedBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))
                ) : (
                  <EmptyState
                    title="No rejected bookings"
                    subtitle="Rejected requests will appear here."
                  />
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
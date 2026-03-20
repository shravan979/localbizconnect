import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../components/Shared/Navbar";

type Provider = {
  _id?: string;
  name: string;
  category?: string;
  phone?: string;
};

type Booking = {
  _id: string;
  status: "pending" | "accepted" | "rejected" | string;
  createdAt?: string;
  serviceTitle?: string;
  description?: string;
  preferredDate?: string;
  urgency?: "low" | "medium" | "high" | string;
  providerId?: {
    name?: string;
    category?: string;
    phone?: string;
  };
};

export default function CustomerDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null
  );
  const [bookingForm, setBookingForm] = useState({
    serviceTitle: "",
    description: "",
    preferredDate: "",
    urgency: "medium",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/providers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProviders(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load providers");
      } finally {
        setLoadingProviders(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/booking/customer`,
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
        setLoadingBookings(false);
      }
    };

    fetchProviders();
    fetchBookings();
  }, [token]);

  const reloadBookings = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/booking/customer`,
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
      setLoadingBookings(false);
    }
  };

  const handleBookingInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openBookingForm = (providerId?: string) => {
    if (!providerId) return;
    setSelectedProviderId(providerId);
    setError("");
    setMessage("");
  };

  const cancelBookingForm = () => {
    setSelectedProviderId(null);
    setBookingForm({
      serviceTitle: "",
      description: "",
      preferredDate: "",
      urgency: "medium",
    });
  };

  const submitBooking = async () => {
    if (!selectedProviderId) return;

    if (!bookingForm.serviceTitle.trim() || !bookingForm.description.trim()) {
      setError("Service title and description are required");
      return;
    }

    try {
      setBookingLoading(selectedProviderId);
      setError("");
      setMessage("");

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/booking`,
        {
          providerId: selectedProviderId,
          serviceTitle: bookingForm.serviceTitle,
          description: bookingForm.description,
          preferredDate: bookingForm.preferredDate,
          urgency: bookingForm.urgency,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Booking request sent successfully");
      setLoadingBookings(true);
      await reloadBookings();
      cancelBookingForm();
    } catch (err) {
      console.error(err);
      setError("Booking failed");
    } finally {
      setBookingLoading(null);
    }
  };

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) =>
      provider.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [providers, search]);

  const acceptedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "accepted"),
    [bookings]
  );

  const getStatusClasses = (status: string) => {
    if (status === "accepted") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getUrgencyClasses = (urgency?: string) => {
    if (urgency === "high") return "bg-red-100 text-red-700";
    if (urgency === "low") return "bg-slate-100 text-slate-700";
    return "bg-yellow-100 text-yellow-700";
  };

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
        <Navbar title="Customer Dashboard" />

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Providers</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {providers.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">My Bookings</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {bookings.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Accepted</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {acceptedBookings.length}
            </h2>
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

        <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Available Providers
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and send detailed service requests
              </p>
            </div>

            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Search providers by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {loadingProviders ? (
            <p className="text-slate-600">Loading providers...</p>
          ) : filteredProviders.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProviders.map((provider, index) => (
                <div
                  key={provider._id || index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {provider.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Local service provider
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {provider.category || "General"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-slate-600">
                    <p>🛠️ Category: {provider.category || "N/A"}</p>
                    <p>📞 Phone: {provider.phone || "N/A"}</p>
                  </div>

                  {selectedProviderId === provider._id ? (
                    <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                      <input
                        type="text"
                        name="serviceTitle"
                        value={bookingForm.serviceTitle}
                        onChange={handleBookingInputChange}
                        placeholder="Service needed"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />

                      <textarea
                        name="description"
                        value={bookingForm.description}
                        onChange={handleBookingInputChange}
                        placeholder="Describe the issue"
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />

                      <input
                        type="datetime-local"
                        name="preferredDate"
                        value={bookingForm.preferredDate}
                        onChange={handleBookingInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />

                      <select
                        name="urgency"
                        value={bookingForm.urgency}
                        onChange={handleBookingInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="low">Low urgency</option>
                        <option value="medium">Medium urgency</option>
                        <option value="high">High urgency</option>
                      </select>

                      <div className="flex gap-3">
                        <button
                          onClick={submitBooking}
                          disabled={bookingLoading === provider._id}
                          className="flex-1 rounded-xl bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {bookingLoading === provider._id
                            ? "Sending..."
                            : "Send Request"}
                        </button>

                        <button
                          onClick={cancelBookingForm}
                          type="button"
                          className="flex-1 rounded-xl bg-slate-200 py-2.5 font-medium text-slate-700 transition hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openBookingForm(provider._id)}
                      className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700"
                    >
                      Book Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No providers found"
              subtitle="Try a different search or add more providers."
            />
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">My Bookings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Track the status of your detailed service requests
            </p>
          </div>

          {loadingBookings ? (
            <p className="text-slate-600">Loading bookings...</p>
          ) : bookings.length > 0 ? (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {booking.providerId?.name || "Unknown Provider"}
                      </h3>

                      <div className="mt-3 space-y-1 text-sm text-slate-600">
                        <p>🛠️ Category: {booking.providerId?.category || "N/A"}</p>
                        <p>📞 Phone: {booking.providerId?.phone || "N/A"}</p>
                        <p>📌 Service: {booking.serviceTitle || "N/A"}</p>
                        <p>📝 Description: {booking.description || "N/A"}</p>

                        {booking.preferredDate && (
                          <p>
                            📅 Preferred:{" "}
                            {new Date(booking.preferredDate).toLocaleString()}
                          </p>
                        )}

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
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No bookings yet"
              subtitle="Book a provider to see your requests here."
            />
          )}
        </section>
      </div>
    </div>
  );
}
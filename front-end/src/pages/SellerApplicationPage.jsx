import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AccountLayout from "../components/AccountLayout";
import axios from "../lib/axios";
import { checkAuth } from "../store/slices/authSlice";

const initialForm = {
  storeName: "",
  contactPhone: "",
  businessType: "individual",
  category: "Clothing",
  website: "",
  description: "",
};

const fieldClassName =
  "w-full border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-[#f4f1e9] placeholder:text-white/30 transition focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20";
const labelClassName =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65";

const SellerApplicationPage = () => {
  const dispatch = useDispatch();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  const loadApplication = useCallback(async () => {
    setIsLoading(true);
    setLoadFailed(false);
    setError("");
    try {
      const { data } = await axios.get("/seller-applications/mine");
      setApplication(data.application ?? null);
      if (data.application?.status === "rejected") {
        setForm({
          storeName: data.application.storeName,
          contactPhone: data.application.contactPhone,
          businessType: data.application.businessType,
          category: data.application.category,
          website: data.application.website || "",
          description: data.application.description,
        });
      }
      if (data.role === "seller") dispatch(checkAuth());
    } catch (requestError) {
      setLoadFailed(true);
      setError(
        requestError.response?.data?.error?.message ||
          "Your seller application status could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const { data } = await axios.post("/seller-applications", form);
      setApplication(data.application);
      toast.success(data.message);
    } catch (requestError) {
      const message =
        requestError.response?.data?.error?.message ||
        "Your application could not be submitted.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = application?.status === "pending";
  const isApproved = application?.status === "approved";

  return (
    <AccountLayout
      role="customer"
      destinationKey="sellerApplication"
      footerLabel="Seller applications"
    >
      <div className="mx-auto max-w-3xl py-10 md:py-14 xl:py-16">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c6b2ff]">
          Vistyle / sell with us
        </p>
        <h1 className="mb-3 font-serif text-4xl font-light leading-tight tracking-[-0.04em] text-[#f4f1e9] sm:text-5xl">
          Build your store here.
        </h1>
        <p className="mb-8 max-w-2xl text-sm leading-6 text-white/65">
          Seller access starts with an application. Tell us about your store
          and what you plan to offer. Our team will review it before you can
          publish products.
        </p>

        {isLoading ? (
          <p role="status" className="border border-white/10 bg-[#181815]/65 p-6 text-sm text-white/75">
            Checking your application...
          </p>
        ) : loadFailed ? (
          <div
            role="alert"
            className="border border-rose-300/25 bg-rose-400/[0.08] p-6"
          >
            <p className="mb-4 text-sm leading-6 text-rose-100">{error}</p>
            <button
              type="button"
              onClick={loadApplication}
              className="min-h-11 border border-[#c6b2ff]/60 px-4 text-sm font-medium text-[#e3d8ff] transition hover:bg-[#c6b2ff]/10"
            >
              Try again
            </button>
          </div>
        ) : isApproved ? (
          <section className="border border-emerald-300/25 bg-emerald-300/[0.06] p-6 sm:p-8">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200">
              Application approved
            </p>
            <h2 className="mb-3 font-serif text-2xl font-light text-[#f4f1e9]">
              Your seller account is ready.
            </h2>
            <p className="mb-6 text-sm leading-6 text-white/65">
              {application.reviewNote ||
                "You can now create and manage your store listings."}
            </p>
            <Link
              to="/seller-panel"
              className="inline-flex min-h-11 items-center border border-[#c6b2ff] bg-[#c6b2ff] px-5 text-sm font-semibold text-[#17151b] no-underline transition hover:bg-[#d5c8ff]"
            >
              Open seller studio
            </Link>
          </section>
        ) : isPending ? (
          <section className="border border-[#c6b2ff]/30 bg-[#c6b2ff]/[0.06] p-6 sm:p-8">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9ccff]">
              Under review
            </p>
            <h2 className="mb-3 font-serif text-2xl font-light text-[#f4f1e9]">
              We have your application.
            </h2>
            <p className="mb-0 text-sm leading-6 text-white/65">
              We’ll review the details for {application.storeName}. Seller
              controls will become available after approval.
            </p>
          </section>
        ) : (
          <section className="border border-white/10 bg-[#181815]/65 p-5 sm:p-8">
            {application?.status === "rejected" && (
              <div className="mb-6 border border-amber-200/20 bg-amber-200/[0.05] p-4">
                <h2 className="mb-1 text-sm font-semibold text-amber-100">
                  We couldn’t approve this application.
                </h2>
                <p className="mb-0 text-sm leading-6 text-white/65">
                  {application.reviewNote ||
                    "You can update your details and submit a new application."}
                </p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClassName} htmlFor="seller-store-name">
                    Store name
                  </label>
                  <input
                    id="seller-store-name"
                    name="storeName"
                    value={form.storeName}
                    onChange={handleChange}
                    className={fieldClassName}
                    minLength={2}
                    maxLength={100}
                    autoComplete="organization"
                    required
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="seller-phone">
                    Contact phone
                  </label>
                  <input
                    id="seller-phone"
                    name="contactPhone"
                    type="tel"
                    value={form.contactPhone}
                    onChange={handleChange}
                    className={fieldClassName}
                    autoComplete="tel"
                    placeholder="+1 555 010 1234"
                    required
                  />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="seller-business-type">
                    Business type
                  </label>
                  <select
                    id="seller-business-type"
                    name="businessType"
                    value={form.businessType}
                    onChange={handleChange}
                    className={`${fieldClassName} bg-[#1a191b]`}
                  >
                    <option value="individual">Individual seller</option>
                    <option value="registered">Registered business</option>
                  </select>
                </div>
                <div>
                  <label className={labelClassName} htmlFor="seller-category">
                    Main product category
                  </label>
                  <select
                    id="seller-category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={`${fieldClassName} bg-[#1a191b]`}
                  >
                    <option>Clothing</option>
                    <option>Bags &amp; accessories</option>
                    <option>Shoes</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClassName} htmlFor="seller-website">
                  Store or business website <span className="normal-case tracking-normal text-white/40">(optional)</span>
                </label>
                <input
                  id="seller-website"
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleChange}
                  className={fieldClassName}
                  maxLength={200}
                  placeholder="https://example.com"
                />
                <p className="mb-0 mt-2 text-xs text-white/45">
                  If provided, use a secure HTTPS link.
                </p>
              </div>
              <div>
                <label className={labelClassName} htmlFor="seller-description">
                  Tell us about your store
                </label>
                <textarea
                  id="seller-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={`${fieldClassName} min-h-32 resize-y`}
                  minLength={30}
                  maxLength={1000}
                  placeholder="What do you plan to sell, and what makes your store distinctive?"
                  required
                />
                <p className="mb-0 mt-2 text-right text-xs text-white/40">
                  {form.description.length}/1000
                </p>
              </div>
              {error && (
                <p
                  role="alert"
                  className="border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12 w-full border border-[#c6b2ff] bg-[#c6b2ff] px-5 text-sm font-semibold text-[#17151b] transition hover:bg-[#d5c8ff] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit for review"}
              </button>
            </form>
          </section>
        )}
      </div>
    </AccountLayout>
  );
};

export default SellerApplicationPage;

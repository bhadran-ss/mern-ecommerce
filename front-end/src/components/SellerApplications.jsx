import { useCallback, useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import toast from "react-hot-toast";
import axios from "../lib/axios";

const SellerApplicationCard = ({ application, onReviewed }) => {
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState("");

  const review = async (decision) => {
    setIsReviewing(true);
    setError("");
    try {
      const { data } = await axios.patch(
        `/seller-applications/${application.id}/review`,
        { decision, reviewNote },
      );
      onReviewed(application.id);
      toast.success(data.message);
    } catch (requestError) {
      const message =
        requestError.response?.data?.error?.message ||
        "The application could not be reviewed.";
      setError(message);
      toast.error(message);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <article className="border border-white/10 bg-[#11110f]/70 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d9ccff]">
            {application.category} /{" "}
            {application.businessType === "registered"
              ? "Registered business"
              : "Individual seller"}
          </p>
          <h3 className="mb-1 font-serif text-2xl font-light text-[#f4f1e9]">
            {application.storeName}
          </h3>
          <p className="mb-0 text-sm text-white/65">
            {application.name} · {application.email}
          </p>
        </div>
        <time
          className="text-xs text-white/45"
          dateTime={application.submittedAt}
        >
          Submitted {new Date(application.submittedAt).toLocaleDateString()}
        </time>
      </div>

      <div className="mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Contact
          </p>
          <p className="mb-0 text-sm text-white/75">{application.contactPhone}</p>
          {application.website && (
            <a
              href={application.website}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block break-all text-sm text-[#d9ccff] underline decoration-[#c6b2ff]/40 underline-offset-4"
            >
              {application.website}
            </a>
          )}
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Store overview
          </p>
          <p className="mb-0 whitespace-pre-wrap text-sm leading-6 text-white/70">
            {application.description}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <label
          htmlFor={`review-note-${application.id}`}
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55"
        >
          Review note{" "}
          <span className="normal-case tracking-normal text-white/35">
            (required when declining)
          </span>
        </label>
        <textarea
          id={`review-note-${application.id}`}
          value={reviewNote}
          onChange={(event) => setReviewNote(event.target.value)}
          maxLength={500}
          rows={2}
          className="w-full resize-y border border-white/15 bg-white/[0.035] px-3 py-2 text-sm text-[#f4f1e9] placeholder:text-white/30 focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20"
          placeholder="Add approval next steps or explain what needs to change."
        />
        <p className="mb-0 mt-1 text-xs text-white/40">
          Declines need a note of at least 10 characters so the applicant knows
          what to address.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-rose-200">
            {error}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => review("approved")}
            disabled={isReviewing}
            className="min-h-11 border border-[#c6b2ff] bg-[#c6b2ff] px-4 text-sm font-semibold text-[#17151b] transition hover:bg-[#d5c8ff] disabled:cursor-wait disabled:opacity-60"
          >
            {isReviewing ? "Saving..." : "Approve seller"}
          </button>
          <button
            type="button"
            onClick={() => review("rejected")}
            disabled={isReviewing || reviewNote.trim().length < 10}
            className="min-h-11 border border-rose-200/30 px-4 text-sm font-medium text-rose-100 transition hover:bg-rose-200/[0.08] disabled:cursor-wait disabled:opacity-60"
          >
            Decline application
          </button>
        </div>
      </div>
    </article>
  );
};

const SellerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/seller-applications");
      if (!Array.isArray(data.applications)) {
        throw new Error("The seller applications response was invalid.");
      }
      setApplications(data.applications);
    } catch (requestError) {
      const message =
        requestError.response?.data?.error?.message ||
        requestError.message ||
        "Seller applications could not be loaded.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleReviewed = (applicationId) => {
    setApplications((current) =>
      current.filter((application) => application.id !== applicationId),
    );
  };

  return (
    <section aria-label="Seller applications" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c6b2ff]">
            Seller onboarding
          </p>
          <h2 className="mb-0 font-serif text-2xl font-light text-[#f4f1e9]">
            Pending applications
          </h2>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="inline-flex min-h-11 items-center gap-2 border border-white/15 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-[#c6b2ff]/60 hover:bg-[#c6b2ff]/[0.06] hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          <RotateCw
            size={15}
            aria-hidden="true"
            className={isLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="border border-rose-300/25 bg-rose-400/[0.08] p-4 text-sm text-rose-100"
        >
          <p className="mb-3">{error}</p>
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="text-[#e3d8ff] underline underline-offset-4 disabled:opacity-60"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading ? (
        <p role="status" className="border border-white/10 p-6 text-sm text-white/65">
          Loading seller applications...
        </p>
      ) : applications.length === 0 && !error ? (
        <p className="border border-white/10 bg-[#11110f]/70 p-6 text-sm text-white/65">
          There are no pending seller applications.
        </p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <SellerApplicationCard
              key={application.id}
              application={application}
              onReviewed={handleReviewed}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SellerApplications;

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { clearAuthError, registerUser } from "../store/slices/authSlice";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "customer",
};

const Register = () => {
  const [formData, setFormData] = useState(initialFormData);
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    dispatch(clearAuthError());
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <AuthLayout
      eyebrow="Make it yours"
      title="Find your way in."
      description="Create an account to get started with Vistyle."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[#e3d8ff] underline decoration-[#c6b2ff]/50 underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} aria-busy={isLoading}>
        <div>
          <label
            htmlFor="register-name"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65"
          >
            Name
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            placeholder="Your name"
            className="w-full border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-[#f4f1e9] placeholder:text-white/30 transition focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label
            htmlFor="register-email"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65"
          >
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
            className="w-full border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-[#f4f1e9] placeholder:text-white/30 transition focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label
            htmlFor="register-password"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65"
          >
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={72}
            aria-describedby="password-guidance"
            placeholder="Create a password"
            className="w-full border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-[#f4f1e9] placeholder:text-white/30 transition focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <p id="password-guidance" className="mt-2 text-xs text-white/45">
            Use 12 characters or more.
          </p>
        </div>
        <div>
          <label
            htmlFor="register-confirm-password"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65"
          >
            Confirm password
          </label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={72}
            placeholder="Enter your password again"
            className="w-full border border-white/15 bg-white/[0.045] px-4 py-3 text-sm text-[#f4f1e9] placeholder:text-white/30 transition focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label
            htmlFor="register-role"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65"
          >
            Account type
          </label>
          <select
            id="register-role"
            name="role"
            className="w-full appearance-none border border-white/15 bg-[#1a191b] px-4 py-3 text-sm text-[#f4f1e9] transition focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
          </select>
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
          disabled={isLoading}
          className="group flex w-full items-center justify-between border border-[#c6b2ff] bg-[#c6b2ff] px-5 py-4 text-left text-sm font-semibold tracking-wide text-[#17151b] transition hover:bg-[#d5c8ff] disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
        >
          <span>{isLoading ? "Creating account..." : "Create your account"}</span>
          <span
            aria-hidden="true"
            className="text-lg transition-transform group-hover:translate-x-1"
          >
            &#8599;
          </span>
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;

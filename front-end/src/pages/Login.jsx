import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { clearAuthError, loginUser } from "../store/slices/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Good to see you."
      description="Sign in to continue to your Vistyle account."
      footer={
        <>
          New to Vistyle?{" "}
          <Link
            to="/register"
            className="font-medium text-[#e3d8ff] underline decoration-[#c6b2ff]/50 underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6b2ff]"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} aria-busy={isLoading}>
        <div>
          <label
            htmlFor="login-email"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            className="w-full border border-white/15 bg-white/[0.045] px-4 py-3.5 text-sm text-[#f4f1e9] placeholder:text-white/30 transition focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              dispatch(clearAuthError());
            }}
            required
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65"
          >
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full border border-white/15 bg-white/[0.045] px-4 py-3.5 text-sm text-[#f4f1e9] placeholder:text-white/30 transition focus:border-[#c6b2ff]/80 focus:outline-none focus:ring-2 focus:ring-[#c6b2ff]/20"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              dispatch(clearAuthError());
            }}
            required
          />
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
          <span>{isLoading ? "Signing in..." : "Sign in to your account"}</span>
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

export default Login;

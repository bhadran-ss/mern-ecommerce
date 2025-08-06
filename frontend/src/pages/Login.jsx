import React, { useState } from "react";
import { useUserStore } from "../stores/useUserStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useUserStore();
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };
  return (
    <>
      {isLoading ? (
        <div
          id="preloader"
          className="fixed inset-0 flex items-center justify-center bg-white z-50"
        >
          <div className="loader"></div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              Login
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition duration-300">
                Login
              </button>
            </form>
            <p className="mt-4 text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="text-gray-900 font-medium underline"
              >
                Register
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;

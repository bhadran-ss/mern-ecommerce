import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../store/slices/authSlice";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
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
              Create an Account
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                maxLength={254}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <p className="text-xs text-gray-600">
                Use at least 12 characters with uppercase, lowercase, number,
                and symbol characters.
              </p>
              <input
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition duration-300">
                Register
              </button>
            </form>
            <p className="mt-4 text-sm text-center text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-gray-900 font-medium underline">
                Login
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;

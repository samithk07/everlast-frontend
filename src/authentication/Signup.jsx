// components/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://everlast-backend.onrender.com"; 
// 🔴 CHANGE THIS TO YOUR REAL RENDER BACKEND URL

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const { user, login } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      toast.info("You are already logged in!", { autoClose: 2000 });

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        const returnToCheckout =
          sessionStorage.getItem("returnToCheckout");
        if (returnToCheckout) {
          sessionStorage.removeItem("returnToCheckout");
          navigate("/checkout");
        } else {
          navigate("/home");
        }
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!data.password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const loginUser = async (userData) => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      const users = response.data;

      const foundUser = users.find(
        (u) =>
          u.email &&
          u.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (!foundUser) {
        throw new Error("No account found with this email");
      }

      if (foundUser.password !== userData.password) {
        throw new Error("Invalid password");
      }

      return {
        ...foundUser,
        role: foundUser.role || "user",
        status: foundUser.status || "active",
      };
    } catch (error) {
      console.log("Backend failed, trying localStorage...");
      return loginWithLocalStorage(userData);
    }
  };

  const loginWithLocalStorage = (userData) => {
    const storedUsers =
      JSON.parse(localStorage.getItem("registeredUsers")) || [];

    const foundUser = storedUsers.find(
      (u) =>
        u.email &&
        u.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (!foundUser) {
      throw new Error("No account found with this email");
    }

    if (foundUser.password !== userData.password) {
      throw new Error("Invalid password");
    }

    return {
      ...foundUser,
      role: foundUser.role || "user",
      status: foundUser.status || "active",
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user) {
      toast.error("You are already logged in!");
      return;
    }

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Object.values(validationErrors).forEach((err) =>
        toast.error(err)
      );
      return;
    }

    try {
      setIsLoading(true);
      const userData = await loginUser(formData);

      if (userData.status === "blocked") {
        throw new Error("Your account has been blocked.");
      }

      if (userData.status === "pending") {
        throw new Error(
          "Your account is pending approval."
        );
      }

      login({
        id: userData.id,
        email: userData.email,
        username: userData.name || userData.username,
        role: userData.role,
      });

      toast.success(
        `Welcome back, ${
          userData.name ||
          userData.username ||
          userData.email
        }!`
      );

      setTimeout(() => {
        if (userData.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          const returnToCheckout =
            sessionStorage.getItem("returnToCheckout");

          if (returnToCheckout) {
            sessionStorage.removeItem("returnToCheckout");
            navigate("/checkout");
          } else {
            navigate("/home");
          }
        }
      }, 1000);
    } catch (error) {
      setServerError(error.message);
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Login
          </h2>

          {serverError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-3 rounded"
            />
            {errors.email && (
              <p className="text-red-500 text-xs">
                {errors.email}
              </p>
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border p-3 rounded"
            />
            {errors.password && (
              <p className="text-red-500 text-xs">
                {errors.password}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-center mt-4">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-500 font-semibold"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;

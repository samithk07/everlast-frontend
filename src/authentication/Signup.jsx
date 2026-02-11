// components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();
    const { user, login } = useAuth();

    // Redirect if user is already logged in
    useEffect(() => {
        if (user) {
            // Show a message that user is already logged in
            toast.info('You are already logged in!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
            });

            // Redirect based on user role
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                // Check if there's a returnToCheckout session
                const returnToCheckout = sessionStorage.getItem('returnToCheckout');
                if (returnToCheckout) {
                    sessionStorage.removeItem('returnToCheckout');
                    navigate('/checkout');
                } else {
                    navigate('/home');
                }
            }
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
        if (serverError) {
            setServerError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Double check - if user is somehow already logged in, prevent login
        if (user) {
            toast.error('You are already logged in!');
            return;
        }
        
        const validationErrors = validateForm(formData);

        if (Object.keys(validationErrors).length === 0) {
            setIsLoading(true);
            setServerError('');
            try {
                const userData = await loginUser(formData);
                
                // Check if user is blocked
                if (userData.status === 'blocked' || userData.blocked === true) {
                    throw new Error('Your account has been blocked. Please contact support.');
                }
                
                // Check if user is pending approval
                if (userData.status === 'pending') {
                    throw new Error('Your account is pending approval. Please contact administrator.');
                }

                // Login with user data
                login({
                    id: userData.id,
                    email: userData.email,
                    username: userData.name || userData.username,
                    role: userData.role || 'user' // Default to 'user' if role not specified
                });

                // Toastify notification for successful login
                toast.success(`Welcome back, ${userData.name || userData.username || userData.email}!`, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                });

                // Redirect based on user role
                if (userData.role === 'admin') {
                    // Redirect admin to admin dashboard
                    setTimeout(() => {
                        navigate('/admin/dashboard');
                    }, 1000);
                } else {
                    // Regular user flow - check if need to redirect to checkout
                    const returnToCheckout = sessionStorage.getItem('returnToCheckout');
                    if (returnToCheckout) {
                        sessionStorage.removeItem('returnToCheckout');
                        setTimeout(() => {
                            navigate('/checkout');
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            navigate('/home');
                        }, 1000);
                    }
                }
            } catch (error) {
                setServerError(error.message);
                // Toastify notification for login error
                toast.error(error.message || 'Login failed. Please try again.', {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                });
                console.error("Login error:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            setErrors(validationErrors);
            // Show validation errors as toast notifications
            Object.values(validationErrors).forEach(error => {
                toast.error(error, {
                    position: "top-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "light",
                });
            });
        }
    };

    const loginUser = async (userData) => {
        try {
            // First try to get users from JSON Server
            try {
                const response = await axios.get(`http://localhost:3001/users?email=${userData.email}`);
                const users = response.data;

                if (users.length === 0) {
                    throw new Error('No account found with this email');
                }

                const user = users[0];

                if (user.password !== userData.password) {
                    throw new Error('Invalid password');
                }

                // Check for user status field (could be 'status' or 'userStatus')
                const userStatus = user.status || user.userStatus || 'active';
                
                // Return user with status included
                return {
                    ...user,
                    status: userStatus
                };
            } catch (serverError) {
                // If JSON Server fails, try localStorage
                console.log('JSON Server not available, trying localStorage...');
                return loginWithLocalStorage(userData);
            }

        } catch (error) {
            throw error;
        }
    };

    const loginWithLocalStorage = (userData) => {
        // Get users from localStorage (from registration)
        const storedUsers = localStorage.getItem('registeredUsers');
        const users = storedUsers ? JSON.parse(storedUsers) : [];

        // Also check the original db.json users from public folder
        return new Promise((resolve, reject) => {
            axios.get('/db.json')
                .then(response => {
                    const dbUsers = response.data.users || [];
                    const allUsers = [...users, ...dbUsers];
                    
                    const user = allUsers.find(u => 
                        u.email.toLowerCase() === userData.email.toLowerCase()
                    );

                    if (!user) {
                        reject(new Error('No account found with this email'));
                        return;
                    }

                    if (user.password !== userData.password) {
                        reject(new Error('Invalid password'));
                        return;
                    }

                    // Check for user status field (could be 'status' or 'userStatus')
                    const userStatus = user.status || user.userStatus || 'active';
                    
                    // Ensure role is set (default to 'user')
                    const userWithStatus = {
                        ...user,
                        role: user.role || 'user',
                        status: userStatus
                    };

                    resolve(userWithStatus);
                })
                .catch(() => {
                    // If db.json also fails, only use localStorage users
                    const user = users.find(u => 
                        u.email.toLowerCase() === userData.email.toLowerCase()
                    );

                    if (!user) {
                        reject(new Error('No account found with this email'));
                        return;
                    }

                    if (user.password !== userData.password) {
                        reject(new Error('Invalid password'));
                        return;
                    }

                    // Check for user status field
                    const userStatus = user.status || user.userStatus || 'active';
                    
                    // Ensure role is set (default to 'user')
                    const userWithStatus = {
                        ...user,
                        role: user.role || 'user',
                        status: userStatus
                    };

                    resolve(userWithStatus);
                });
        });
    };

    const validateForm = (data) => {
        const errors = {};

        if (!data.email.trim()) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            errors.email = "Email format is invalid";
        }

        if (!data.password.trim()) {
            errors.password = "Password is required";
        }

        return errors;
    };

    // If user is logged in, show a loading state while redirecting
    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">You are already logged in. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div
                className="min-h-screen flex items-center justify-center p-5 bg-cover bg-center bg-fixed"
                style={{
                    backgroundImage: `linear-gradient(rgba(205, 245, 253, 0.55), rgba(160, 233, 255, 0.55), rgba(137, 207, 243, 0.55)), url('src/assets/Gemini_Generated_Image_3jtlgd3jtlgd3jtl.png')`
                }}
            >
                <div className="bg-white rounded-2xl shadow-2xl shadow-blue-500/10 border border-blue-100 p-8 w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Server Error */}
                    {serverError && (
                        <div className={`mb-4 p-3 rounded-lg text-sm ${serverError.includes('blocked') || serverError.includes('pending') ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
                            <div className="flex items-start gap-2">
                                {serverError.includes('blocked') || serverError.includes('pending') ? (
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                )}
                                <div>
                                    {serverError}
                                    {(serverError.includes('blocked') || serverError.includes('pending')) && (
                                        <p className="text-xs mt-1 opacity-90">
                                            Please contact support for assistance.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900 block">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                placeholder="Enter your email"
                                autoComplete="email"
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${errors.email
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                            />
                            {errors.email && (
                                <p className="text-red-600 text-xs font-medium mt-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900 block">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${errors.password
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                            />
                            {errors.password && (
                                <p className="text-red-600 text-xs font-medium mt-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5'
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing In...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-8 pt-6 border-t border-gray-100">
                        <p className="text-gray-500 text-sm">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/signup')}
                                className="text-blue-500 font-semibold hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:underline"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
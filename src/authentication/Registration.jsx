import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext' // Import AuthContext

const Registration = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [isFormValid, setIsFormValid] = useState(false)
    const [serverError, setServerError] = useState('')
    const navigate = useNavigate()
    const { login } = useAuth() // Get login function from AuthContext

    // Check form validity whenever formData changes
    useEffect(() => {
        const validationErrors = validateForm(formData)
        const isValid = Object.keys(validationErrors).length === 0 && 
                       formData.username.trim() !== '' && 
                       formData.email.trim() !== '' && 
                       formData.password.trim() !== '' && 
                       formData.confirmPassword.trim() !== ''
        
        setIsFormValid(isValid)
        setServerError('')
    }, [formData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData, 
            [name]: value
        })
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            })
        }
    }

    const handleBlur = (e) => {
        const { name } = e.target
        setTouched({
            ...touched,
            [name]: true
        })
        
        // Validate field on blur
        const fieldErrors = validateField(name, formData[name])
        if (fieldErrors) {
            setErrors({
                ...errors,
                [name]: fieldErrors
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Mark all fields as touched
        setTouched({
            username: true,
            email: true,
            password: true,
            confirmPassword: true
        })
        
        const validationErrors = validateForm(formData)
        
        if (Object.keys(validationErrors).length === 0) {
            setIsLoading(true)
            setServerError('')
            
            try {
                // First check if JSON Server is running
                let serverAvailable = false;
                try {
                    await axios.get('http://localhost:3001/users', { timeout: 3000 });
                    serverAvailable = true;
                } catch (error) {
                    console.log('JSON Server not available, using localStorage');
                }
                
                let newUser;
                
                if (serverAvailable) {
                    newUser = await registerUser(formData);
                } else {
                    newUser = await registerWithLocalStorage(formData);
                }

                // Use AuthContext login to automatically log the user in after registration
                login({
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                })

                alert("Registration successful! Welcome to Everlast Water Solution.")
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                })
                
                // Redirect to home page after successful registration
                navigate('/home')
            } catch (error) {
                console.error("Registration error:", error)
                setServerError(error.message || "Registration failed! Please try again.")
            } finally {
                setIsLoading(false)
            }
        } else {
            setErrors(validationErrors)
        }
    }

    // Updated registerUser function to save to db.json
    const registerUser = async (userData) => {
        try {
            console.log('Attempting to register user to JSON Server...');
            
            // First, check if user already exists by fetching all users
            const response = await axios.get('http://localhost:3001/users', {
                timeout: 5000
            });
            
            console.log('Fetched users from server:', response.data);
            
            const existingUsers = response.data || [];
            
            // Check if user already exists
            const userExists = existingUsers.find(user => 
                user.email.toLowerCase() === userData.email.toLowerCase()
            );
            
            if (userExists) {
                throw new Error('User with this email already exists');
            }

            // Create new user object
            const newUser = {
                id: Date.now().toString(),
                username: userData.username,
                email: userData.email,
                password: userData.password,
                createdAt: new Date().toISOString()
            };

            console.log('Saving user to server:', newUser);

            // Save to db.json using POST request
            const saveResponse = await axios.post('http://localhost:3001/users', newUser, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Server response:', saveResponse);
            
            if (saveResponse.status === 201) {
                console.log('User saved to db.json successfully:', saveResponse.data);
                return saveResponse.data; // Return the saved user data from server
            } else {
                throw new Error('Failed to save user to database');
            }

        } catch (error) {
            console.error('Registration API error:', error);
            
            if (error.response) {
                // Server responded with error status
                console.error('Server error response:', error.response.data);
                throw new Error(error.response.data.message || 'Registration failed');
            } else if (error.request) {
                // Network error - couldn't reach the server
                console.error('Network error:', error.message);
                throw new Error('Cannot connect to server. Please check if JSON Server is running on port 3001.');
            } else {
                // Other errors
                console.error('Error:', error.message);
                throw new Error(error.message || 'Registration failed');
            }
        }
    }

    // Fallback registration using localStorage
    const registerWithLocalStorage = (userData) => {
        return new Promise((resolve, reject) => {
            try {
                console.log('Registering user with localStorage...');
                
                // Get existing users from localStorage
                const storedUsers = localStorage.getItem('registeredUsers');
                const existingUsers = storedUsers ? JSON.parse(storedUsers) : [];
                
                // Check if user already exists
                const userExists = existingUsers.find(user => 
                    user.email.toLowerCase() === userData.email.toLowerCase()
                );
                
                if (userExists) {
                    reject(new Error('User with this email already exists'));
                    return;
                }

                // Create new user object
                const newUser = {
                    id: Date.now().toString(),
                    username: userData.username,
                    email: userData.email,
                    password: userData.password,
                    createdAt: new Date().toISOString()
                };

                // Save to localStorage
                const updatedUsers = [...existingUsers, newUser];
                localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
                
                console.log('User saved to localStorage successfully:', newUser);
                
                // Also save to users array in localStorage for backward compatibility
                const allUsers = JSON.parse(localStorage.getItem('users')) || [];
                allUsers.push(newUser);
                localStorage.setItem('users', JSON.stringify(allUsers));
                
                resolve(newUser);
                
            } catch (error) {
                console.error('LocalStorage registration error:', error);
                reject(new Error('Registration failed. Please try again.'));
            }
        });
    }

    const validateField = (fieldName, value) => {
        switch (fieldName) {
            case 'username':
                if (!value.trim()) return "Username is required";
                if (value.length < 3) return "Username must be at least 3 characters";
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers and underscore";
                return '';
            
            case 'email':
                if (!value.trim()) return "Email is required";
                if (!/\S+@\S+\.\S+/.test(value)) return "Email format is invalid";
                return '';
            
            case 'password':
                if (!value.trim()) return "Password is required";
                if (value.length < 6) return "Password must be at least 6 characters";
                if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase and one lowercase letter";
                return '';
            
            case 'confirmPassword':
                if (!value.trim()) return "Please confirm your password";
                if (value !== formData.password) return "Passwords do not match";
                return '';
            
            default:
                return '';
        }
    }

    const validateForm = (data) => {
        const errors = {};
        
        const usernameError = validateField('username', data.username);
        if (usernameError) errors.username = usernameError;

        const emailError = validateField('email', data.email);
        if (emailError) errors.email = emailError;

        const passwordError = validateField('password', data.password);
        if (passwordError) errors.password = passwordError;

        const confirmPasswordError = validateField('confirmPassword', data.confirmPassword);
        if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

        return errors;
    }

    // Check if field should show error
    const shouldShowError = (fieldName) => {
        return touched[fieldName] && errors[fieldName];
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-sky-100 bg-cover bg-center bg-fixed flex items-center justify-center p-4 relative"
             style={{
                 backgroundImage: `linear-gradient(rgba(205, 245, 253, 0.55), rgba(160, 233, 255, 0.55), rgba(137, 207, 243, 0.55)), url('/src/assets/rigisterbackground.jpeg')`
             }}>
            
            <div className="absolute top-5 right-5 w-20 h-20 bg-linear-to-br from-blue-200/20 to-cyan-200/20 rounded-full z-1"></div>
            <div className="absolute bottom-10 left-10 w-16 h-16 bg-linear-to-br from-cyan-300/30 to-blue-300/30 rounded-full z-1"></div>
            
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl shadow-blue-500/15 border border-cyan-100/40 p-7 w-full max-w-md relative z-2">
                
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold bg-linear-to-br from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-2 tracking-wide">
                        Create Account
                    </h2>
                    <p className="text-gray-500 text-sm font-normal">
                        Join our community today!
                    </p>
                </div>

                {serverError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        <strong>Error:</strong> {serverError}
                        {serverError.includes('JSON Server') && (
                            <div className="mt-2 text-xs">
                                Please run: <code className="bg-gray-100 px-2 py-1 rounded">json-server --watch db.json --port 3001</code>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-900 mb-1.5 tracking-wide">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            placeholder="Enter your username"
                            autoComplete="off"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3.5 py-3 rounded-lg border-2 text-sm outline-none transition-all duration-300 bg-white/80 text-gray-900
                                ${shouldShowError('username') 
                                    ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
                                    : 'border-cyan-200/50 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(0,169,255,0.1)] focus:bg-white/95'
                                }`}
                        />
                        {shouldShowError('username') && (
                            <p className="text-red-500 text-xs font-medium mt-1">
                                {errors.username}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-900 mb-1.5 tracking-wide">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            placeholder="example@gmail.com"
                            autoComplete="off"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3.5 py-3 rounded-lg border-2 text-sm outline-none transition-all duration-300 bg-white/80 text-gray-900
                                ${shouldShowError('email') 
                                    ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
                                    : 'border-cyan-200/50 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(0,169,255,0.1)] focus:bg-white/95'
                                }`}
                        />
                        {shouldShowError('email') && (
                            <p className="text-red-500 text-xs font-medium mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-900 mb-1.5 tracking-wide">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            placeholder="Enter password"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3.5 py-3 rounded-lg border-2 text-sm outline-none transition-all duration-300 bg-white/80 text-gray-900
                                ${shouldShowError('password') 
                                    ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
                                    : 'border-cyan-200/50 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(0,169,255,0.1)] focus:bg-white/95'
                                }`}
                        />
                        {shouldShowError('password') && (
                            <p className="text-red-500 text-xs font-medium mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-900 mb-1.5 tracking-wide">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            placeholder="Confirm Password"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full px-3.5 py-3 rounded-lg border-2 text-sm outline-none transition-all duration-300 bg-white/80 text-gray-900
                                ${shouldShowError('confirmPassword') 
                                    ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
                                    : 'border-cyan-200/50 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(0,169,255,0.1)] focus:bg-white/95'
                                }`}
                        />
                        {shouldShowError('confirmPassword') && (
                            <p className="text-red-500 text-xs font-medium mt-1">
                                {errors.confirmPassword}
                            </p>
                        )} 
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className={`w-full py-3 px-4 bg-linear-to-br from-blue-500 to-cyan-400 text-white border-none rounded-lg text-sm font-semibold cursor-pointer shadow-lg shadow-blue-500/30 transition-all duration-300 mt-2.5 tracking-wide relative
                            ${!isFormValid || isLoading 
                                ? 'opacity-60 cursor-not-allowed bg-linear-to-br from-gray-400 to-gray-500' 
                                : 'hover:transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Creating Account...
                            </span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p className="text-gray-600 text-sm">
                        Already have an account?{' '}
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-blue-500 hover:text-blue-600 font-semibold transition-colors duration-200"
                        >
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Registration
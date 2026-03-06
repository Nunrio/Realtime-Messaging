import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            setToast({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const closeToast = () => setToast(null);

    return (
        <div className="min-h-screen bg-[#f9fafb] flex font-poppins">
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={closeToast} 
                />
            )}
            {/* Left Side - Content */}
            <div className="w-full lg:w-1/2 flex flex-col min-h-screen">
                {/* Logo */}
                <div className="p-6 lg:p-12 pt-6">
                    <img 
                        src="/images/logo.webp" 
                        alt="Logo" 
                        className="h-16 lg:h-20 w-auto"
                    />
                </div>

                {/* Main Content */}
                <div className="flex-grow flex flex-col justify-center px-6 lg:px-12 pb-6">
                    <div className="max-w-md mx-auto w-full">
                        <h1 className="text-3xl lg:text-5xl font-bold text-black mb-3 lg:mb-4">
                            A place for connections.
                        </h1>
                        <p className="text-base lg:text-lg text-gray-600 mb-6 lg:mb-8">
                            Start conversations, share ideas, and stay close with the people who matter most.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                            <div>
                                <label className="block text-black text-sm font-medium mb-2">
                                    Username or Email
                                </label>
                            <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your username or email"
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-black text-sm font-medium mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="form-input pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me and Forgot password row */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#1E90FF] border-gray-300 rounded focus:ring-[#1E90FF]"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Keep me signed in</span>
                                </label>
                                <Link to="#" className="text-sm text-gray-600 font-semibold hover:underline">
                                    Forgotten your password?
                                </Link>
                            </div>

                        <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <p className="mt-5 lg:mt-6 text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[#1E90FF] hover:underline font-medium">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 lg:p-12 pb-6 text-center lg:text-left">
                    <p className="text-sm text-gray-400">
                        © Messaging 2026
                    </p>
                </div>
            </div>

            {/* Right Side - Landing Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img 
                    src="/images/landing-page.webp" 
                    alt="Landing" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default Login;


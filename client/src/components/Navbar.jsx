import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold text-primary-600">
                        Realtime Messaging
                    </Link>
                    
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link 
                                    to="/dashboard" 
                                    className="text-gray-600 hover:text-primary-600 transition"
                                >
                                    Rooms
                                </Link>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-600">{user?.username}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    className="text-gray-600 hover:text-primary-600 transition"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded transition"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;


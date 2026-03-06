import React from 'react';

const OnlineUsers = ({ users, currentUser }) => {
    return (
        <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Online Users</h3>
            
            {users.length === 0 ? (
                <p className="text-gray-500 text-sm">No users online</p>
            ) : (
                <ul className="space-y-2">
                    {users.map((user) => (
                        <li 
                            key={user.id} 
                            className={`flex items-center gap-2 p-2 rounded ${
                                user.id === currentUser?.id ? 'bg-primary-50' : ''
                            }`}
                        >
                            <span className="online-dot"></span>
                            <span className={`text-gray-700 ${
                                user.id === currentUser?.id ? 'font-semibold' : ''
                            }`}>
                                {user.username}
                                {user.id === currentUser?.id && ' (you)'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default OnlineUsers;


import React from 'react';

const OnlineUsers = ({ users, currentUser }) => {
    const getStatusDotClass = (status) => {
        if (!status) return 'bg-green-500 online-dot';
        if (status === 'Offline' || status === 'invisible') return 'bg-gray-500';
        if (status === 'away') return 'bg-orange-500';
        if (status === 'do not disturb') return 'bg-red-500';
        return 'bg-green-500';
    };

    const getVisibleStatus = (status) => {
        if (status === 'invisible') return 'Offline';
        return status;
    };

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
                            <span className={`w-3 h-3 rounded-full ${getStatusDotClass(user.status)}`}></span>
                            <span className={`text-gray-700 ${
                                user.id === currentUser?.id ? 'font-semibold' : ''
                            }`}>
                                {user.username}
                                {user.status && (
                                    <span className="text-xs text-gray-500 ml-1 capitalize">
                                        {getVisibleStatus(user.status)}
                                    </span>
                                )}
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


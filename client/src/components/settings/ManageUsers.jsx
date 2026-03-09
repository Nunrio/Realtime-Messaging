
import React from 'react';
import { Shield, Users as UsersIcon } from 'lucide-react';

const ManageUsers = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield size={28} className="mr-3 text-[#1E90FF]" />
          Manage Users
        </h1>
        <p className="text-gray-500 mt-1">Manage and moderate user accounts</p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <UsersIcon size={48} className="text-gray-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          User Management Coming Soon
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          This section will allow administrators to view, edit, and manage user accounts. 
          Features will include user list, search, role management, and account actions.
        </p>
      </div>

      {/* Future Features List */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Features:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-[#1E90FF] rounded-full mr-2"></span>
            View all users
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-[#1E90FF] rounded-full mr-2"></span>
            Search and filter users
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-[#1E90FF] rounded-full mr-2"></span>
            Change user roles (User, Moderator, Admin)
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-[#1E90FF] rounded-full mr-2"></span>
            Ban/Unban users
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-[#1E90FF] rounded-full mr-2"></span>
            Delete user accounts
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ManageUsers;


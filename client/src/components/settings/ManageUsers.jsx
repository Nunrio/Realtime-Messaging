import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Search, MoreVertical, User, Ban, VolumeX, Volume2, Archive, Edit, Eye, Check, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminAPI from '../../api/user';

// Permission helpers
const canMute = (currentUser, targetUser) => {
    if (!currentUser || !targetUser) return false;
    const level = { user: 1, moderator: 2, admin: 3, founder: 4 };
    if (level[currentUser.role] < 2) return false;
    if (targetUser.role === 'founder') return false;
    return level[currentUser.role] > level[targetUser.role] || currentUser.role === 'founder';
};

const canBan = (currentUser, targetUser) => {
    if (!currentUser || !targetUser) return false;
    const level = { user: 1, moderator: 2, admin: 3, founder: 4 };
    if (level[currentUser.role] < 3) return false;
    if (targetUser.role === 'founder') return false;
    return level[currentUser.role] > level[targetUser.role] || currentUser.role === 'founder';
};

const canChangeRole = (currentUser, targetUser) => {
    if (!currentUser || !targetUser) return false;
    return currentUser.role === 'founder' && targetUser.role !== 'founder';
};

const canArchive = (currentUser, targetUser) => {
    if (!currentUser || !targetUser) return false;
    return currentUser.role === 'founder' && targetUser.role !== 'founder';
};

const ManageUsers = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Modal states
    const [actionModal, setActionModal] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionReason, setActionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    // Expanded row state
    const [expandedRow, setExpandedRow] = useState(null);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (roleFilter !== 'all') params.role = roleFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            
            const response = await adminAPI.getAllUsers(params);
            setUsers(response.users || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Action handlers
    const handleMute = async () => {
        setActionLoading(true);
        try {
            await adminAPI.muteUser(selectedUser.id, null);
            await fetchUsers();
            setActionModal(null);
            setSelectedUser(null);
            setActionReason('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to mute user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnmute = async () => {
        setActionLoading(true);
        try {
            await adminAPI.unmuteUser(selectedUser.id);
            await fetchUsers();
            setActionModal(null);
            setSelectedUser(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to unmute user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBan = async () => {
        setActionLoading(true);
        try {
            await adminAPI.banUser(selectedUser.id, actionReason || null);
            await fetchUsers();
            setActionModal(null);
            setSelectedUser(null);
            setActionReason('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to ban user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnban = async () => {
        setActionLoading(true);
        try {
            await adminAPI.unbanUser(selectedUser.id);
            await fetchUsers();
            setActionModal(null);
            setSelectedUser(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to unban user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangeRole = async (newRole) => {
        // Prevent multiple clicks
        if (actionLoading) return;
        
        if (!selectedUser || !selectedUser.id) {
            console.error('No user selected for role change');
            alert('Error: No user selected');
            return;
        }
        
        console.log(`Attempting to change role for user ${selectedUser.id} (${selectedUser.username}) to ${newRole}`);
        
        setActionLoading(true);
        try {
            const response = await adminAPI.changeUserRole(selectedUser.id, newRole);
            console.log('Role change success:', response);
            alert(`Successfully changed ${selectedUser.username}'s role to ${newRole}`);
            await fetchUsers();
            setActionModal(null);
            setSelectedUser(null);
        } catch (err) {
            console.error('Failed to change role:', err);
            console.error('Error response:', err.response);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to change role';
            alert(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleArchive = async () => {
        setActionLoading(true);
        try {
            await adminAPI.archiveUser(selectedUser.id);
            await fetchUsers();
            setActionModal(null);
            setSelectedUser(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to archive user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnarchive = async () => {
        setActionLoading(true);
        try {
            await adminAPI.unarchiveUser(selectedUser.id);
            await fetchUsers();
            setActionModal(null);
            setSelectedUser(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to unarchive user');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (user) => {
        // Convert MySQL boolean values (0/1) to proper booleans
        const isArchived = Boolean(user.is_archived);
        const isBanned = Boolean(user.is_banned);
        const isMuted = Boolean(user.is_muted);
        
        if (isArchived) return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">Archived</span>;
        if (isBanned) return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded">Banned</span>;
        if (isMuted) return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-600 rounded">Muted</span>;
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded">Active</span>;
    };


    const getRoleBadge = (role) => {
        return (
            <span className={`role-badge role-badge-${role}`}>
                {role}
            </span>
        );
    };

    const renderActionModal = () => {
        // Don't render for 'role' - that's handled by renderRoleModal
        if (!actionModal || actionModal === 'role' || !selectedUser) return null;

        const modals = {
            mute: {
                title: 'Mute User',
                message: `Are you sure you want to mute ${selectedUser.username}? They will not be able to send messages.`,
                icon: VolumeX,
                iconColor: 'text-yellow-500',
                confirmText: 'Mute User',
                confirmColor: 'bg-yellow-500 hover:bg-yellow-600',
                onConfirm: handleMute
            },
            unmute: {
                title: 'Unmute User',
                message: `Are you sure you want to unmute ${selectedUser.username}? They will be able to send messages again.`,
                icon: Volume2,
                iconColor: 'text-green-500',
                confirmText: 'Unmute User',
                confirmColor: 'bg-green-500 hover:bg-green-600',
                onConfirm: handleUnmute
            },
            ban: {
                title: 'Ban User',
                message: `Are you sure you want to ban ${selectedUser.username}? They will not be able to login.`,
                icon: Ban,
                iconColor: 'text-red-500',
                confirmText: 'Ban User',
                confirmColor: 'bg-red-500 hover:bg-red-600',
                onConfirm: handleBan,
                showReason: true
            },
            unban: {
                title: 'Unban User',
                message: `Are you sure you want to unban ${selectedUser.username}?`,
                icon: Check,
                iconColor: 'text-green-500',
                confirmText: 'Unban User',
                confirmColor: 'bg-green-500 hover:bg-green-600',
                onConfirm: handleUnban
            },
            archive: {
                title: 'Archive User',
                message: `Are you sure you want to archive ${selectedUser.username}? Their account will be hidden but data will be preserved.`,
                icon: Archive,
                iconColor: 'text-gray-500',
                confirmText: 'Archive User',
                confirmColor: 'bg-gray-500 hover:bg-gray-600',
                onConfirm: handleArchive
            },
            unarchive: {
                title: 'Unarchive User',
                message: `Are you sure you want to unarchive ${selectedUser.username}?`,
                icon: Archive,
                iconColor: 'text-green-500',
                confirmText: 'Unarchive User',
                confirmColor: 'bg-green-500 hover:bg-green-600',
                onConfirm: handleUnarchive
            }
        };

        const modal = modals[actionModal];
        const Icon = modal.icon;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                    <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${modal.iconColor} bg-opacity-10`}>
                            <Icon size={20} className={modal.iconColor} />
                        </div>
                        <h3 className="text-lg font-semibold">{modal.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{modal.message}</p>
                    
                    {modal.showReason && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason (optional)
                            </label>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent resize-none"
                                rows={3}
                                placeholder="Enter reason for banning..."
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => { setActionModal(null); setSelectedUser(null); setActionReason(''); }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={modal.onConfirm}
                            disabled={actionLoading}
                            className={`px-4 py-2 text-white rounded-lg transition-colors ${modal.confirmColor} ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {actionLoading ? 'Processing...' : modal.confirmText}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderRoleModal = () => {
        if (actionModal !== 'role' || !selectedUser) return null;
        
        const roles = ['user', 'moderator', 'admin'];

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <Edit size={20} className="text-purple-500" />
                        </div>
                        <h3 className="text-lg font-semibold">Change Role</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                        Select a new role for <strong>{selectedUser.username}</strong>
                    </p>
                    
                    <div className="space-y-2 mb-4">
                        {roles.map(role => (
                            <button
                                key={role}
                                onClick={() => handleChangeRole(role)}
                                disabled={actionLoading || selectedUser.role === role}
                                className={`w-full px-4 py-3 text-left rounded-lg border transition-colors ${
                                    selectedUser.role === role
                                        ? 'border-[#1E90FF] bg-blue-50 text-[#1E90FF]'
                                        : 'border-gray-200 hover:border-[#1E90FF] hover:bg-gray-50'
                                } ${actionLoading || selectedUser.role === role ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="capitalize font-medium">{role}</span>
                                {selectedUser.role === role && <span className="ml-2 text-sm">(Current)</span>}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={() => { setActionModal(null); setSelectedUser(null); }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Helper function to convert MySQL boolean (0/1) to JavaScript boolean
    const toBool = (val) => Boolean(val);

    const renderExpandedActions = (user) => {
        // Convert MySQL boolean values (0/1) to proper booleans
        const isMuted = toBool(user.is_muted);
        const isBanned = toBool(user.is_banned);
        const isArchived = toBool(user.is_archived);
        
        return (
            <tr key={`${user.id}-expanded`} className="bg-gray-50">
                <td colSpan={6} className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                        <button 
                            className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <Eye size={16} className="mr-2 text-gray-400" />
                            View Profile
                        </button>
                        
                        {canMute(currentUser, user) && !isMuted && (
                            <button
                                onClick={() => { setSelectedUser(user); setActionModal('mute'); }}
                                className="flex items-center px-3 py-2 text-sm text-yellow-700 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-50"
                            >
                                <VolumeX size={16} className="mr-2 text-yellow-500" />
                                Mute
                            </button>
                        )}
                        {canMute(currentUser, user) && isMuted && (
                            <button
                                onClick={() => { setSelectedUser(user); setActionModal('unmute'); }}
                                className="flex items-center px-3 py-2 text-sm text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50"
                            >
                                <Volume2 size={16} className="mr-2 text-green-500" />
                                Unmute
                            </button>
                        )}
                        
                        {canBan(currentUser, user) && !isBanned && (
                            <button
                                onClick={() => { setSelectedUser(user); setActionModal('ban'); }}
                                className="flex items-center px-3 py-2 text-sm text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50"
                            >
                                <Ban size={16} className="mr-2 text-red-500" />
                                Ban
                            </button>
                        )}
                        {canBan(currentUser, user) && isBanned && (
                            <button
                                onClick={() => { setSelectedUser(user); setActionModal('unban'); }}
                                className="flex items-center px-3 py-2 text-sm text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50"
                            >
                                <Check size={16} className="mr-2 text-green-500" />
                                Unban
                            </button>
                        )}
                        
                        {canChangeRole(currentUser, user) && (
                            <button
                                onClick={() => { setSelectedUser(user); setActionModal('role'); }}
                                className="flex items-center px-3 py-2 text-sm text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-50"
                            >
                                <Edit size={16} className="mr-2 text-purple-500" />
                                Change Role
                            </button>
                        )}
                        
                        {canArchive(currentUser, user) && !isArchived && (
                            <button
                                onClick={() => { setSelectedUser(user); setActionModal('archive'); }}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <Archive size={16} className="mr-2 text-gray-400" />
                                Archive
                            </button>
                        )}
                        {canArchive(currentUser, user) && isArchived && (
                            <button
                                onClick={() => { setSelectedUser(user); setActionModal('unarchive'); }}
                                className="flex items-center px-3 py-2 text-sm text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50"
                            >
                                <Archive size={16} className="mr-2 text-green-500" />
                                Unarchive
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 flex items-center">
                    <Shield size={28} className="mr-3 text-[#1E90FF]" />
                    Manage Users
                </h1>
                <p className="text-gray-500 mt-1">Manage and moderate user accounts</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div className="w-40">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                            <option value="founder">Founder</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-40">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="muted">Muted</option>
                            <option value="banned">Banned</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E90FF] mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading users...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <AlertTriangle size={48} className="text-red-400 mx-auto mb-2" />
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={fetchUsers}
                            className="mt-4 px-4 py-2 bg-[#1E90FF] text-white rounded-lg hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center">
                        <User size={48} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map(user => (
                                    <React.Fragment key={user.id}>
                                        <tr 
                                            className={`hover:bg-gray-50 cursor-pointer ${expandedRow === user.id ? 'bg-gray-50' : ''}`}
                                            onClick={() => setExpandedRow(expandedRow === user.id ? null : user.id)}
                                        >
                                            <td className="px-6 py-4">
                                                {expandedRow === user.id ? (
                                                    <ChevronDown size={20} className="text-gray-400" />
                                                ) : (
                                                    <ChevronRight size={20} className="text-gray-400" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full"
                                                            src={user.profile_picture || '/images/default-avatar.webp'}
                                                            alt=""
                                                            onError={(e) => { e.target.src = '/images/default-avatar.webp'; }}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.display_name || user.username}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            @{user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(user)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedRow === user.id && renderExpandedActions(user)}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Results count */}
            {!loading && !error && (
                <div className="mt-4 text-sm text-gray-500">
                    Showing {users.length} user{users.length !== 1 ? 's' : ''}
                </div>
            )}

            {/* Action Modals */}
            {renderActionModal()}
            {renderRoleModal()}
        </div>
    );
};

export default ManageUsers;


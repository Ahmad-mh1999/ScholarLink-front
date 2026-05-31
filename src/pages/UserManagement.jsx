/**
 * UserManagement - Super Admin User Management Page
 * Features: View users, change roles, verify users, suspend/restore accounts
 * Role restrictions: Only user, reviewer, moderator roles available (no admin)
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetAdminUsersQuery, useUpdateAdminUserMutation } from '../api/baseApi';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Mail,
  GraduationCap,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2
} from 'lucide-react';

/**
 * RoleBadge Component - Displays user role with appropriate color
 */
const RoleBadge = ({ role }) => {
  const roleConfig = {
    user: { color: 'gray', label: 'User' },
    reviewer: { color: 'blue', label: 'Reviewer' },
    moderator: { color: 'orange', label: 'Moderator' },
    admin: { color: 'red', label: 'Admin' }
  };

  const config = roleConfig[role] || roleConfig.user;

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold bg-${config.color}-50 text-${config.color}-500 uppercase tracking-widest`}>
      {config.label}
    </span>
  );
};

/**
 * VerificationBadge Component - Shows verification status
 */
const VerificationBadge = ({ isVerified, emailVerified }) => {
  if (isVerified && emailVerified) {
    return (
      <div className="flex items-center justify-center">
        <CheckCircle className="w-5 h-5 text-green-500" />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center">
        <XCircle className="w-5 h-5 text-red-500" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <AlertTriangle className="w-5 h-5 text-yellow-500" />
    </div>
  );
};

/**
 * RoleChangeDropdown Component - Handles role changes with confirmation
 */
const RoleChangeDropdown = ({ user, onRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [showConfirm, setShowConfirm] = useState(false);

  // Available roles (excluding admin)
  const availableRoles = [
    { value: 'user', label: 'User' },
    { value: 'reviewer', label: 'Reviewer' }
  ];

  const handleRoleSelect = (role) => {
    if (role === user.role) {
      setIsOpen(false);
      return;
    }
    setSelectedRole(role);
    setShowConfirm(true);
    setIsOpen(false);
  };

  const confirmRoleChange = () => {
    onRoleChange(user.id, selectedRole);
    setShowConfirm(false);
  };

  const cancelRoleChange = () => {
    setSelectedRole(user.role);
    setShowConfirm(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-600 transition-all"
      >
        <Shield className="w-3 h-3" />
        <span className="capitalize">{user.role}</span>
        <ChevronDown className="w-3 h-3" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 z-50 bg-white border border-gray-100 rounded-xl shadow-lg w-40 py-1">
          {availableRoles.map((role) => (
            <button
              key={role.value}
              onClick={() => handleRoleSelect(role.value)}
              className="w-full text-left px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
            >
              {role.label}
            </button>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-bold text-primary">Confirm Role Change</h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to change <strong>{user.first_name} {user.last_name}</strong>'s role
              from <strong className="capitalize">{user.role}</strong> to <strong className="capitalize">{selectedRole}</strong>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmRoleChange}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all"
              >
                Confirm
              </button>
              <button
                onClick={cancelRoleChange}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserManagement = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const { data: usersData, isLoading, error, refetch } = useGetAdminUsersQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateAdminUserMutation();

  // Filter users based on search and filters
  const filteredUsers = React.useMemo(() => {
    if (!usersData?.results) return [];

    return usersData.results.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Verification filter
      const matchesVerification = verificationFilter === 'all' ||
        (verificationFilter === 'verified' && user.is_verified && user.email_verified) ||
        (verificationFilter === 'unverified' && (!user.is_verified || !user.email_verified)) ||
        (verificationFilter === 'pending' && !user.is_verified);

      return matchesSearch && matchesRole && matchesVerification;
    });
  }, [usersData, searchTerm, roleFilter, verificationFilter]);

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUser({
        id: userId,
        role: newRole
      }).unwrap();

      toast.success('User role updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Role change error:', error);
    }
  };

  // Handle user verification
  const handleVerifyUser = async (userId) => {
    try {
      await updateUser({
        id: userId,
        is_verified: true
      }).unwrap();

      toast.success('User verified successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to verify user');
      console.error('Verification error:', error);
    }
  };

  // Handle user suspension
  const handleSuspendUser = async (userId) => {
    try {
      await updateUser({
        id: userId,
        is_active: false
      }).unwrap();

      toast.success('User suspended successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to suspend user');
      console.error('Suspension error:', error);
    }
  };

  // Handle user restoration
  const handleRestoreUser = async (userId) => {
    try {
      await updateUser({
        id: userId,
        is_active: true
      }).unwrap();

      toast.success('User restored successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to restore user');
      console.error('Restoration error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
        <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-primary mb-2">Loading Users...</h3>
        <p className="text-gray-400 font-medium">Fetching user management data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-primary mb-2">Error Loading Users</h3>
        <p className="text-gray-400 font-medium">Unable to fetch user data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary tracking-tight leading-none mb-2">
            User Management
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Manage academic roles and verification states
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{filteredUsers.length}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F7FAFC] border border-gray-100 rounded-xl text-sm font-medium text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full lg:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3 bg-[#F7FAFC] border border-gray-100 rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="reviewer">Reviewers</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div className="w-full lg:w-48">
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-4 py-3 bg-[#F7FAFC] border border-gray-100 rounded-xl text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="pending">Pending</option>
            </select>
          </div>

        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="px-8 py-6 border-b border-gray-50">
          <h3 className="text-lg font-bold text-primary">Users ({filteredUsers.length})</h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FBFCFE]">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Verified</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center">
                    <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">No users found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    {/* User Info */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm uppercase">
                          {(user.first_name?.[0] || '') + (user.last_name?.[0] || '') || user.username?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-primary group-hover:text-accent transition-colors">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">{user.email}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-8 py-6">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Academic Status */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {user.academic_status || 'Not specified'}
                        </span>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="px-8 py-6 text-center">
                      <VerificationBadge
                        isVerified={user.is_verified}
                        emailVerified={user.email_verified}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Role Change Dropdown */}
                        <RoleChangeDropdown
                          user={user}
                          onRoleChange={handleRoleChange}
                        />

                        {/* Verify Button */}
                        {(!user.is_verified || !user.email_verified) && (
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-all disabled:opacity-50"
                          >
                            <UserCheck className="w-3 h-3" />
                          </button>
                        )}

                        {/* Suspend/Restore Button */}
                        {user.is_active ? (
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                          >
                            <UserX className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreUser(user.id)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Loading overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <span className="text-sm font-medium text-primary">Updating...</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default UserManagement;

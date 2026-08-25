import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import {
    UsersIcon,
    BuildingOfficeIcon,
    HomeIcon,
    UserGroupIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAgents: 0,
        totalProperties: 0,
        pendingProperties: 0,
        approvedProperties: 0,
        rejectedProperties: 0,
        totalBlockedUsers: 0,
        recentUsers: [],
        recentProperties: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/admin/dashboard');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers + stats.totalAgents,
            icon: UsersIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            link: '/admin/users'
        },
        {
            title: 'Agents',
            value: stats.totalAgents,
            icon: UserGroupIcon,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            link: '/admin/users?role=seller'
        },
        {
            title: 'Total Properties',
            value: stats.totalProperties,
            icon: HomeIcon,
            color: 'text-green-600',
            bg: 'bg-green-100',
            link: '/admin/properties'
        },
        {
            title: 'Pending Approval',
            value: stats.pendingProperties,
            icon: ClockIcon,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100',
            link: '/admin/properties?status=Pending'
        },
        {
            title: 'Approved',
            value: stats.approvedProperties,
            icon: CheckCircleIcon,
            color: 'text-green-600',
            bg: 'bg-green-100',
            link: '/admin/properties?status=Approved'
        },
        {
            title: 'Blocked Users',
            value: stats.totalBlockedUsers,
            icon: XCircleIcon,
            color: 'text-red-600',
            bg: 'bg-red-100',
            link: '/admin/users?blocked=true'
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your real estate platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <Link
                        key={index}
                        to={stat.link}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`${stat.bg} p-3 rounded-full`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
                    {stats.recentUsers?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No recent users</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentUsers?.map((user) => (
                                <div key={user._id} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link to="/admin/users" className="text-blue-600 hover:underline text-sm mt-4 block">
                        View all users →
                    </Link>
                </div>

                {/* Recent Properties */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Properties</h2>
                    {stats.recentProperties?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No recent properties</p>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentProperties?.map((property) => (
                                <div key={property._id} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">{property.title}</p>
                                        <p className="text-sm text-gray-600">
                                            ${property.price?.toLocaleString()} • {property.listingType}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        property.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                        property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {property.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link to="/admin/properties" className="text-blue-600 hover:underline text-sm mt-4 block">
                        View all properties →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
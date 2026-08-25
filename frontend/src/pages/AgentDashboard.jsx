import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import {
    PlusIcon,
    HomeIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

const AgentDashboard = () => {
    const [stats, setStats] = useState({
        totalProperties: 0,
        pendingProperties: 0,
        approvedProperties: 0,
        rejectedProperties: 0,
        activeProperties: 0,
        totalViews: 0,
        recentProperties: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/agent/dashboard');
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
            title: 'Total Properties',
            value: stats.totalProperties,
            icon: HomeIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            link: '/agent/properties'
        },
        {
            title: 'Pending',
            value: stats.pendingProperties,
            icon: ClockIcon,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100',
            link: '/agent/properties?status=Pending'
        },
        {
            title: 'Approved',
            value: stats.approvedProperties,
            icon: CheckCircleIcon,
            color: 'text-green-600',
            bg: 'bg-green-100',
            link: '/agent/properties?status=Approved'
        },
        {
            title: 'Active Listings',
            value: stats.activeProperties,
            icon: EyeIcon,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            link: '/agent/properties?status=Active'
        },
        {
            title: 'Total Views',
            value: stats.totalViews,
            icon: EyeIcon,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            link: '/agent/properties'
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
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your property listings</p>
                </div>
                <Link
                    to="/agent/properties/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Property
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map((stat, index) => (
                    <Link
                        key={index}
                        to={stat.link}
                        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`${stat.bg} p-2 rounded-full`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Properties */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Properties</h2>
                    <Link to="/agent/properties" className="text-blue-600 hover:underline text-sm">
                        View all →
                    </Link>
                </div>
                
                {stats.recentProperties?.length === 0 ? (
                    <div className="text-center py-12">
                        <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">You haven't listed any properties yet.</p>
                        <Link
                            to="/agent/properties/add"
                            className="text-blue-600 hover:underline mt-2 inline-block"
                        >
                            Add your first property →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.recentProperties.map((property) => (
                            <div key={property._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <img
                                    src={property.mainImage || '/placeholder-house.jpg'}
                                    alt={property.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900">{property.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        ${property.price?.toLocaleString()} • {property.listingType}
                                    </p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            property.status === 'Approved' || property.status === 'Active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : property.status === 'Pending' 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {property.status}
                                        </span>
                                        <Link
                                            to={`/agent/properties/${property._id}/edit`}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDashboard;
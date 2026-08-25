import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { HeartIcon, BuildingOfficeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const UserDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalFavorites: 0,
        totalViewed: 0,
    });
    const [recentProperties, setRecentProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [favoritesRes, propertiesRes] = await Promise.all([
                axios.get('/buyer/favorites'),
                axios.get('/buyer/recently-viewed'),
            ]);
            
            setStats({
                totalFavorites: favoritesRes.data?.data?.length || 0,
                totalViewed: propertiesRes.data?.data?.length || 0,
            });
            setRecentProperties(propertiesRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsCards = [
        {
            title: 'Favorites',
            value: stats.totalFavorites,
            icon: HeartIcon,
            color: 'text-red-500',
            bg: 'bg-red-50',
            link: '/favorites'
        },
        {
            title: 'Properties Viewed',
            value: stats.totalViewed,
            icon: BuildingOfficeIcon,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            link: '/properties'
        },
        {
            title: 'Profile',
            value: 'View',
            icon: UserCircleIcon,
            color: 'text-green-500',
            bg: 'bg-green-50',
            link: '/profile'
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
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                    Find your dream property today
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statsCards.map((stat, index) => (
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

            {/* Recent Properties */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Recently Viewed Properties
                </h2>
                {recentProperties.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        You haven't viewed any properties yet.
                        <br />
                        <Link to="/properties" className="text-blue-600 hover:underline">
                            Start browsing now →
                        </Link>
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recentProperties.slice(0, 3).map((property) => (
                            <Link
                                key={property._id}
                                to={`/properties/${property._id}`}
                                className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                            >
                                <img
                                    src={property.mainImage || '/placeholder-house.jpg'}
                                    alt={property.title}
                                    className="w-full h-40 object-cover rounded-md mb-2"
                                />
                                <h3 className="font-medium text-gray-900">{property.title}</h3>
                                <p className="text-sm text-gray-600">
                                    ${property.price?.toLocaleString()}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
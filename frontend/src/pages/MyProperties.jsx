import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const MyProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchProperties();
    }, [filter]);

    const fetchProperties = async () => {
        try {
            const url = filter === 'all' 
                ? '/agent/properties' 
                : `/agent/properties?status=${filter}`;
            const response = await axios.get(url);
            if (response.data.success) {
                setProperties(response.data.data.properties);
            }
        } catch (error) {
            toast.error('Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;
        
        try {
            const response = await axios.delete(`/agent/properties/${id}`);
            if (response.data.success) {
                toast.success('Property deleted successfully');
                fetchProperties();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete property');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Active': 'bg-blue-100 text-blue-800',
            'Sold': 'bg-gray-100 text-gray-800',
            'Rented': 'bg-purple-100 text-purple-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

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
                    <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
                    <p className="text-gray-600 mt-1">Manage your property listings</p>
                </div>
                <Link
                    to="/agent/properties/add"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                    + Add New
                </Link>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {['all', 'Pending', 'Approved', 'Rejected', 'Active', 'Sold'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Properties Grid */}
            {properties.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500 text-lg">No properties found</p>
                    <Link to="/agent/properties/add" className="text-blue-600 hover:underline mt-2 inline-block">
                        Add your first property →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <img
                                src={property.mainImage || '/placeholder-house.jpg'}
                                alt={property.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-900 text-lg">{property.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                        {property.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {property.location?.city}, {property.location?.country}
                                </p>
                                <p className="text-lg font-bold text-blue-600 mt-2">
                                    NPR {property.price?.toLocaleString()}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <span>{property.bedrooms} 🛏️</span>
                                    <span>{property.bathrooms} 🛁</span>
                                    <span>{property.area} {property.areaUnit}</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Link
                                        to={`/agent/properties/${property._id}/edit`}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md text-sm transition-colors"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(property._id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md text-sm transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProperties;
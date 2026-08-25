import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { 
    BuildingOfficeIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    ClockIcon,
    EyeIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const AdminPropertyManagement = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        propertyType: '',
        listingType: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        page: 1,
        limit: 10
    });

    const propertyTypes = ['Apartment', 'House', 'Villa', 'Condo', 'Land', 'Commercial', 'Other'];
    const listingTypes = ['Sale', 'Rent'];
    const statuses = ['Pending', 'Approved', 'Rejected', 'Active', 'Sold', 'Rented'];

    useEffect(() => {
        fetchProperties();
    }, [filters]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...filters,
                page: filters.page,
                limit: filters.limit
            });
            const response = await axios.get(`/admin/properties?${params}`);
            if (response.data.success) {
                setProperties(response.data.data.properties);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    const updatePropertyStatus = async (propertyId, status) => {
        try {
            const response = await axios.patch(`/admin/properties/${propertyId}/status`, { status });
            if (response.data.success) {
                toast.success(`Property ${status.toLowerCase()} successfully`);
                fetchProperties();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update property');
        }
    };

    const deleteProperty = async (propertyId) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;
        
        try {
            const response = await axios.delete(`/admin/properties/${propertyId}`);
            if (response.data.success) {
                toast.success('Property deleted successfully');
                fetchProperties();
            }
        } catch (error) {
            toast.error('Failed to delete property');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Active': 'bg-blue-100 text-blue-800',
            'Sold': 'bg-gray-100 text-gray-800',
            'Rented': 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'Pending': <ClockIcon className="h-5 w-5 text-yellow-500" />,
            'Approved': <CheckCircleIcon className="h-5 w-5 text-green-500" />,
            'Rejected': <XCircleIcon className="h-5 w-5 text-red-500" />,
            'Active': <CheckCircleIcon className="h-5 w-5 text-blue-500" />
        };
        return icons[status] || <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />;
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            propertyType: '',
            listingType: '',
            search: '',
            page: 1,
            limit: 10
        });
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
                    <p className="text-gray-600 mt-1">Manage all property listings on the platform</p>
                </div>
                <div className="text-sm text-gray-500">
                    Total: {pagination.total} properties
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search properties..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Status</option>
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <select
                        name="propertyType"
                        value={filters.propertyType}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Types</option>
                        {propertyTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <select
                        name="listingType"
                        value={filters.listingType}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Listings</option>
                        {listingTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <button
                        onClick={clearFilters}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-md transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Properties Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Property
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Agent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {properties.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No properties found
                                    </td>
                                </tr>
                            ) : (
                                properties.map((property) => (
                                    <tr key={property._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={property.mainImage || '/placeholder-house.jpg'}
                                                    alt={property.title}
                                                    className="h-12 w-12 rounded-md object-cover mr-3"
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {property.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {property.location?.city}, {property.location?.country}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {property.propertyType} • {property.listingType}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                NPR {property.price?.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {property.bedrooms} 🛏️ • {property.bathrooms} 🛁
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {property.agent?.name || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {property.agent?.email || ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getStatusIcon(property.status)}
                                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                                    {property.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    to={`/properties/${property._id}`}
                                                    target="_blank"
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                {property.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => updatePropertyStatus(property._id, 'Approved')}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updatePropertyStatus(property._id, 'Rejected')}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {property.status === 'Approved' && (
                                                    <button
                                                        onClick={() => updatePropertyStatus(property._id, 'Active')}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                                {property.status === 'Active' && (
                                                    <button
                                                        onClick={() => updatePropertyStatus(property._id, 'Sold')}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        Mark Sold
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteProperty(property._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                            Showing {properties.length} of {pagination.total} properties
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPropertyManagement;
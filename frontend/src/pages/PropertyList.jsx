import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const PropertyList = () => {
    const [searchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        propertyType: searchParams.get('propertyType') || '',
        listingType: searchParams.get('listingType') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        city: searchParams.get('city') || '',
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9,
        total: 0,
        pages: 0,
    });

    const propertyTypes = ['Apartment', 'House', 'Villa', 'Condo', 'Land', 'Commercial', 'Other'];
    const listingTypes = ['Sale', 'Rent'];

    useEffect(() => {
        fetchProperties();
    }, [filters, pagination.page]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                ...filters,
                page: pagination.page,
                limit: pagination.limit,
            });
            const response = await axios.get(`/buyer/properties?${params}`);
            if (response.data.success) {
                setProperties(response.data.data.properties);
                setPagination({
                    ...pagination,
                    total: response.data.data.pagination.total,
                    pages: response.data.data.pagination.pages,
                });
            }
        } catch (error) {
            toast.error('Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setPagination({ ...pagination, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setPagination({ ...pagination, page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            propertyType: '',
            listingType: '',
            minPrice: '',
            maxPrice: '',
            city: '',
        });
        setPagination({ ...pagination, page: 1 });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Properties</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search properties..."
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="text"
                        name="city"
                        value={filters.city}
                        onChange={handleFilterChange}
                        placeholder="City"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
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
                    <div>
                        <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            placeholder="Min Price"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            placeholder="Max Price"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                        <button
                            onClick={fetchProperties}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={clearFilters}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-gray-600">
                Found {pagination.total} properties
            </div>

            {/* Properties Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : properties.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500 text-lg">No properties found matching your criteria</p>
                    <button
                        onClick={clearFilters}
                        className="text-blue-600 hover:underline mt-2"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <Link
                                key={property._id}
                                to={`/properties/${property._id}`}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <img
                                    src={property.mainImage || '/placeholder-house.jpg'}
                                    alt={property.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 text-lg">{property.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {property.location?.city}, {property.location?.country}
                                    </p>
                                    <p className="text-xl font-bold text-blue-600 mt-2">
                                        NPR {property.price?.toLocaleString()}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span>{property.bedrooms} 🛏️</span>
                                        <span>{property.bathrooms} 🛁</span>
                                        <span>{property.area} {property.areaUnit}</span>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                            {property.listingType}
                                        </span>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {property.propertyType}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PropertyList;
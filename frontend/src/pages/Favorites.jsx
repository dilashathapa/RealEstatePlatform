import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { HeartIcon } from '@heroicons/react/24/solid';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await axios.get('/buyer/favorites');
            if (response.data.success) {
                setFavorites(response.data.data || []);
            }
        } catch (error) {
            toast.error('Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (propertyId) => {
        try {
            const response = await axios.post(`/buyer/favorites/${propertyId}`);
            if (response.data.success) {
                setFavorites(favorites.filter(fav => fav._id !== propertyId));
                toast.success('Removed from favorites');
            }
        } catch (error) {
            toast.error('Failed to remove favorite');
        }
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
            <div className="flex items-center gap-3 mb-8">
                <HeartIcon className="h-8 w-8 text-red-500" />
                <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            </div>

            {favorites.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No favorites yet</p>
                    <Link to="/properties" className="text-blue-600 hover:underline mt-2 inline-block">
                        Browse properties →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((property) => (
                        <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                            <Link to={`/properties/${property._id}`}>
                                <img
                                    src={property.mainImage || '/placeholder-house.jpg'}
                                    alt={property.title}
                                    className="w-full h-48 object-cover"
                                />
                            </Link>
                            <div className="p-4">
                                <Link to={`/properties/${property._id}`}>
                                    <h3 className="font-semibold text-gray-900 text-lg hover:text-blue-600">
                                        {property.title}
                                    </h3>
                                </Link>
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
                                <button
                                    onClick={() => removeFavorite(property._id)}
                                    className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition-colors"
                                >
                                    Remove from Favorites
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;
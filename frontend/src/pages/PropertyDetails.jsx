import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { HeartIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showContactForm, setShowContactForm] = useState(false);

    useEffect(() => {
        fetchPropertyDetails();
        if (isAuthenticated) {
            checkFavorite();
        }
    }, [id, isAuthenticated]);

    const fetchPropertyDetails = async () => {
        try {
            const response = await axios.get(`/buyer/properties/${id}`);
            if (response.data.success) {
                setProperty(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load property details');
            navigate('/properties');
        } finally {
            setLoading(false);
        }
    };

    const checkFavorite = async () => {
        try {
            const response = await axios.get('/buyer/favorites');
            if (response.data.success) {
                const favorites = response.data.data || [];
                setIsFavorite(favorites.some(fav => fav._id === id));
            }
        } catch (error) {
            console.error('Error checking favorites:', error);
        }
    };

    const toggleFavorite = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to save favorites');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(`/buyer/favorites/${id}`);
            if (response.data.success) {
                setIsFavorite(!isFavorite);
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to update favorites');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Property not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
                ← Back to Properties
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Images & Details - Left Side */}
                <div className="lg:col-span-2">
                    {/* Main Image */}
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                        <img
                            src={property.mainImage || property.images?.[0] || '/placeholder-house.jpg'}
                            alt={property.title}
                            className="w-full h-[400px] object-cover"
                        />
                        <button
                            onClick={toggleFavorite}
                            className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                            {isFavorite ? (
                                <HeartSolidIcon className="h-6 w-6 text-red-500" />
                            ) : (
                                <HeartIcon className="h-6 w-6 text-gray-600" />
                            )}
                        </button>
                        <div className="absolute bottom-4 left-4 flex gap-2">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                                {property.listingType}
                            </span>
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                                {property.status}
                            </span>
                        </div>
                    </div>

                    {/* Thumbnail Gallery */}
                    {property.images && property.images.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto">
                            {property.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Property ${index + 1}`}
                                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                                        selectedImage === index ? 'border-blue-600' : 'border-transparent'
                                    }`}
                                    onClick={() => setSelectedImage(index)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Property Details */}
                    <div className="mt-6">
                        <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                        <div className="flex items-center gap-2 mt-2 text-gray-600">
                            <MapPinIcon className="h-5 w-5" />
                            <span>
                                {property.location?.address}, {property.location?.city}, {property.location?.country}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600 mt-4">
                            NPR {property.price?.toLocaleString()}
                        </p>

                        {/* Key Features */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-600">Bedrooms</p>
                                <p className="text-xl font-semibold">{property.bedrooms}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-600">Bathrooms</p>
                                <p className="text-xl font-semibold">{property.bathrooms}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-600">Area</p>
                                <p className="text-xl font-semibold">
                                    {property.area} {property.areaUnit}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center">
                                <p className="text-sm text-gray-600">Year Built</p>
                                <p className="text-xl font-semibold">{property.yearBuilt || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                            <p className="text-gray-700 leading-relaxed">{property.description}</p>
                        </div>

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Amenities</h2>
                                <div className="flex flex-wrap gap-2">
                                    {property.amenities.map((amenity, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                                        >
                                            {amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Agent Info & Contact - Right Side */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Information</h3>
                        
                        {property.agent ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={property.agent.profilePic || '/default-avatar.png'}
                                        alt={property.agent.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{property.agent.name}</p>
                                        <p className="text-sm text-gray-600">Real Estate Agent</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <a
                                        href={`mailto:${property.agent.email}`}
                                        className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                                    >
                                        <EnvelopeIcon className="h-5 w-5" />
                                        <span>{property.agent.email}</span>
                                    </a>
                                    {property.agent.phone && (
                                        <a
                                            href={`tel:${property.agent.phone}`}
                                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                                        >
                                            <PhoneIcon className="h-5 w-5" />
                                            <span>{property.agent.phone}</span>
                                        </a>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowContactForm(!showContactForm)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    {showContactForm ? 'Close' : 'Contact Agent'}
                                </button>

                                {showContactForm && (
                                    <div className="mt-4">
                                        <textarea
                                            placeholder="Write your message here..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            rows="4"
                                        />
                                        <button className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
                                            Send Message
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">Agent information not available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;
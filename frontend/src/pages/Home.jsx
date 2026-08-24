import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-6xl font-bold text-gray-900">
                        Find Your{' '}
                        <span className="text-blue-600">Dream Property</span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
                        Browse thousands of properties for sale and rent. 
                        Connect with trusted agents and find your perfect home.
                    </p>
                    
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/properties"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                        >
                            Browse Properties
                        </Link>
                        {!isAuthenticated && (
                            <Link
                                to="/register"
                                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-900">Search Properties</h3>
                        <p className="mt-2 text-gray-600">
                            Find properties by location, price, type, and more
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <div className="text-4xl mb-4">🏠</div>
                        <h3 className="text-xl font-semibold text-gray-900">List Your Property</h3>
                        <p className="mt-2 text-gray-600">
                            Agents can list and manage properties easily
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <div className="text-4xl mb-4">💬</div>
                        <h3 className="text-xl font-semibold text-gray-900">Connect with Agents</h3>
                        <p className="mt-2 text-gray-600">
                            Contact agents directly about properties
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
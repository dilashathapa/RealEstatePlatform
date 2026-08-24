import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './utils/PrivateRoute';

// Components
import Navbar from './components/common/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-gray-50">
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                        }}
                    />
                    <Navbar />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
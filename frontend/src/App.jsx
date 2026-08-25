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
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AddProperty from './pages/AddProperty';
import MyProperties from './pages/MyProperties';
import PropertyList from './pages/PropertyList';
import PropertyDetails from './pages/PropertyDetails'; 
import Favorites from './pages/Favorites'; 
import AdminUserManagement from './pages/AdminUserManagement';
import AdminPropertyManagement from './pages/AdminPropertyManagement';

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
                        <Route path="/properties" element={<PropertyList />} />
                        <Route path="/properties/:id" element={<PropertyDetails />} /> 

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } />
                        <Route path="/profile" element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } />

                        {/* User Routes */}
                        <Route path="/user/dashboard" element={
                            <PrivateRoute roles={['buyer']}>
                                <UserDashboard />
                            </PrivateRoute>
                        } />
                        <Route path="/favorites" element={
                            <PrivateRoute roles={['buyer']}>
                                <Favorites />
                            </PrivateRoute>
                        } /> 

                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={
                            <PrivateRoute roles={['admin']}>
                                <AdminDashboard />
                            </PrivateRoute>
                        } />
                        
                        <Route path="/admin/users" element={
                        <PrivateRoute roles={['admin']}>
                            <AdminUserManagement />
                        </PrivateRoute>
                        } />
                        <Route path="/admin/properties" element={
                        <PrivateRoute roles={['admin']}>
                            <AdminPropertyManagement />
                        </PrivateRoute>
                        } />

                        {/* Agent Routes */}
                        <Route path="/agent/dashboard" element={
                            <PrivateRoute roles={['seller']}>
                                <AgentDashboard />
                            </PrivateRoute>
                        } />
                        <Route path="/agent/properties/add" element={
                            <PrivateRoute roles={['seller']}>
                                <AddProperty />
                            </PrivateRoute>
                        } />
                        <Route path="/agent/properties" element={
                            <PrivateRoute roles={['seller']}>
                                <MyProperties />
                            </PrivateRoute>
                        } />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
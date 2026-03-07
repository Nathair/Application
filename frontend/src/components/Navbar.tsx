import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Calendar, Home, PlusCircle, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMobileOpen(false);
    };

    const isActive = (path: string) =>
        location.pathname === path ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:border-blue-400 hover:text-blue-600';

    const mobileLink = (path: string) =>
        location.pathname === path
            ? 'bg-blue-50 text-blue-700 font-semibold'
            : 'text-gray-700 hover:bg-gray-50';

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex flex-shrink-0 items-center gap-2" onClick={() => setMobileOpen(false)}>
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                                E
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">Eventify</span>
                        </Link>
                        {/* Desktop links */}
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                            <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 transition-colors text-sm font-medium gap-1.5 ${isActive('/')}`}>
                                <Home size={18} /> Public Events
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <Link to="/my-events" className={`inline-flex items-center px-1 pt-1 border-b-2 transition-colors text-sm font-medium gap-1.5 ${isActive('/my-events')}`}>
                                        <Calendar size={18} /> My Calendar
                                    </Link>
                                    <Link to="/create-event" className={`inline-flex items-center px-1 pt-1 border-b-2 transition-colors text-sm font-medium gap-1.5 ${isActive('/create-event')}`}>
                                        <PlusCircle size={18} /> Create Event
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop right side */}
                    <div className="hidden sm:flex sm:items-center">
                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Login</Link>
                                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">Sign up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile burger button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="sm:hidden border-t border-gray-100 bg-white shadow-lg">
                    <div className="px-4 py-3 space-y-1">
                        <Link to="/" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${mobileLink('/')}`}>
                            <Home size={18} /> Public Events
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link to="/my-events" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${mobileLink('/my-events')}`}>
                                    <Calendar size={18} /> My Calendar
                                </Link>
                                <Link to="/create-event" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${mobileLink('/create-event')}`}>
                                    <PlusCircle size={18} /> Create Event
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100">
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut size={18} /> Logout
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-center text-gray-700 hover:text-blue-600 px-3 py-2.5 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">Login</Link>
                                <Link to="/register" onClick={() => setMobileOpen(false)} className="text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

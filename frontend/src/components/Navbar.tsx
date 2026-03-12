import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Calendar, Home, PlusCircle, Menu, X, Tag as TagIcon, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from './Button';

export default function Navbar() {
    const { isAuthenticated, logout } = useAuthStore();
    const { colorEventsByTag, toggleColorByTag } = useSettingsStore();
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
                                    <Link to="/assistant" className={`inline-flex items-center px-1 pt-1 border-b-2 transition-colors text-sm font-medium gap-1.5 ${isActive('/assistant')}`}>
                                        <Sparkles size={18} className="text-blue-600" /> AI Assistant
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Desktop right side */}
                    <div className="hidden sm:flex sm:items-center gap-4">
                        <div className="flex items-center gap-2 mr-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden lg:block">Color Cards</span>
                            <button
                                onClick={toggleColorByTag}
                                title={`${colorEventsByTag ? 'Disable' : 'Enable'} tag-based event coloring`}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${colorEventsByTag ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span className="sr-only">Toggle tag coloring</span>
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${colorEventsByTag ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        {isAuthenticated ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                icon={<LogOut size={16} />}
                                className="!bg-gray-50 hover:!bg-gray-100 !text-gray-700 !border-gray-200"
                            >
                                Logout
                            </Button>
                        ) : (
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                >
                                    Login
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => navigate('/register')}
                                >
                                    Sign up
                                </Button>
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
                                <Link to="/assistant" onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${mobileLink('/assistant')}`}>
                                    <Sparkles size={18} className="text-blue-500" /> AI Assistant
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 space-y-3">
                        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <TagIcon size={16} className="text-gray-400" /> Tag-based coloring
                            </span>
                            <button
                                onClick={toggleColorByTag}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${colorEventsByTag ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${colorEventsByTag ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        {isAuthenticated ? (
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                icon={<LogOut size={18} />}
                                className="w-full !text-red-600 !border-red-50 hover:!bg-red-50 !justify-start"
                            >
                                Logout
                            </Button>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => { setMobileOpen(false); navigate('/login'); }}
                                >
                                    Login
                                </Button>
                                <Button
                                    onClick={() => { setMobileOpen(false); navigate('/register'); }}
                                >
                                    Sign up
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

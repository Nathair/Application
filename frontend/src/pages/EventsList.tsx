import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Event } from '../types';
import { format, parseISO, isBefore, startOfDay, isSameDay } from 'date-fns';
import { MapPin, Users, Calendar, Clock, ChevronRight, Search, Filter, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuthStore } from '../store/authStore';
import { Modal, type ModalProps } from '../components/Modal';

export default function EventsList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [joinedEventIds, setJoinedEventIds] = useState<Set<number>>(new Set());

    // Modal state
    const [modal, setModal] = useState<{
        open: boolean; type: ModalProps['type']; title: string; message: string;
    }>({ open: false, type: 'info', title: '', message: '' });

    const showModal = (type: ModalProps['type'], title: string, message: string) => {
        setModal({ open: true, type, title, message });
    };

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [temporalFilter, setTemporalFilter] = useState<'active' | 'past' | 'all'>('active');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events');
                setEvents(res.data);
            } catch (err) {
                console.error("Failed to fetch events", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchJoined = async () => {
            if (isAuthenticated) {
                try {
                    const res = await api.get('/users/me/events');
                    const ids = new Set<number>(res.data.map((e: any) => e.id));
                    setJoinedEventIds(ids);
                } catch (err) {
                    console.error("Failed to fetch joined events", err);
                }
            }
        };

        fetchEvents();
        fetchJoined();
    }, [isAuthenticated]);

    const handleJoinLeave = async (e: React.MouseEvent, eventId: number, action: 'join' | 'leave') => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) return navigate('/login');

        try {
            await api.post(`/events/${eventId}/${action}`);

            // Update local state
            setJoinedEventIds(prev => {
                const next = new Set(prev);
                if (action === 'join') next.add(eventId);
                else next.delete(eventId);
                return next;
            });

            // Update events count locally
            setEvents(prev => prev.map(ev => {
                if (ev.id === eventId) {
                    const currentCount = ev._count?.participants || 0;
                    return {
                        ...ev,
                        _count: { participants: action === 'join' ? currentCount + 1 : currentCount - 1 }
                    };
                }
                return ev;
            }));

        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error executing action';
            showModal('error', action === 'join' ? 'Cannot Join' : 'Cannot Leave', msg);
        }
    };

    const filteredEvents = useMemo(() => {
        let result = [...events];

        // Case-insensitive text filter (title or description)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.title.toLowerCase().includes(q) ||
                (e.description || '').toLowerCase().includes(q)
            );
        }

        // Date range filter
        if (dateFrom) {
            const from = startOfDay(dateFrom);
            result = result.filter(e => !isBefore(parseISO(e.date), from));
        }
        if (dateTo) {
            const to = startOfDay(dateTo);
            to.setDate(to.getDate() + 1);
            result = result.filter(e => isBefore(parseISO(e.date), to));
        }

        // Temporal filter (Active/Past)
        const now = new Date();
        if (temporalFilter === 'active') {
            result = result.filter(e => !isBefore(parseISO(e.date), now));
        } else if (temporalFilter === 'past') {
            result = result.filter(e => isBefore(parseISO(e.date), now));
        }

        // Final sort: active early first, past late first
        return result.sort((a, b) => {
            const dA = new Date(a.date).getTime();
            const dB = new Date(b.date).getTime();
            return temporalFilter === 'past' ? dB - dA : dA - dB;
        });
    }, [events, searchQuery, dateFrom, dateTo, temporalFilter]);

    const clearFilters = () => {
        setSearchQuery('');
        setDateFrom(null);
        setDateTo(null);
    };

    const hasFilters = searchQuery || dateFrom || dateTo;

    // Shared date picker input class — same single-line style as CreateEvent
    const dpClass = "w-full py-2.5 px-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white";

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Modal
                isOpen={modal.open}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onClose={() => setModal(m => ({ ...m, open: false }))}
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Discover Events</h1>
                    <p className="text-lg text-gray-600">Find and join the best events happening around you.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm mb-1">
                    <Filter size={16} className="text-blue-500" /> Filters
                    {hasFilters && (
                        <button onClick={clearFilters} className="ml-auto text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                            <X size={14} /> Clear all
                        </button>
                    )}
                </div>

                {/* Text search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search by title or description..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                    />
                </div>

                {/* Date range */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">From date</label>
                        <DatePicker
                            selected={dateFrom}
                            onChange={(date: Date | null) => setDateFrom(date)}
                            selectsStart
                            startDate={dateFrom}
                            endDate={dateTo}
                            placeholderText="Start date"
                            dateFormat="MMM d, yyyy"
                            className={dpClass}
                            wrapperClassName="w-full"
                            isClearable
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">To date</label>
                        <DatePicker
                            selected={dateTo}
                            onChange={(date: Date | null) => setDateTo(date)}
                            selectsEnd
                            startDate={dateFrom}
                            endDate={dateTo}
                            minDate={dateFrom ?? undefined}
                            placeholderText="End date"
                            dateFormat="MMM d, yyyy"
                            className={dpClass}
                            wrapperClassName="w-full"
                            isClearable
                        />
                    </div>
                </div>
                {/* Temporal Filter Tabs */}
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200 w-fit">
                    {(['active', 'past', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setTemporalFilter(f)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${temporalFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count */}
            {hasFilters && (
                <p className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-800">{filteredEvents.length}</span> of {events.length} events
                </p>
            )}

            {filteredEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-500">{hasFilters ? 'Try adjusting your filters.' : 'There are currently no public events available.'}</p>
                    {hasFilters && (
                        <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">Clear filters</button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                        const isFull = event.capacity && event._count && (event._count.participants >= event.capacity);
                        const isFinished = isBefore(parseISO(event.date), new Date());
                        const isOrganizer = user?.id === event.organizerId;
                        const isJoined = joinedEventIds.has(event.id);

                        return (
                            <div key={event.id} className="group bg-white flex flex-col justify-between rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 tracking-wide uppercase">
                                            {event.visibility}
                                        </span>
                                        <div className="flex gap-2">
                                            {isFull && (
                                                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Full</span>
                                            )}
                                            {isFinished && (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">Finished</span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{event.title}</h3>
                                    <p className="text-gray-600 mb-6 line-clamp-2 text-sm">{event.description || "No description provided."}</p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start text-sm text-gray-500">
                                            <Clock size={16} className="mr-2 text-gray-400 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-700">
                                                    {format(new Date(event.date), 'MMM d, yyyy, h:mm a')}
                                                </p>
                                                {event.endDate && (
                                                    <p className="text-gray-500 text-xs">
                                                        – {format(new Date(event.endDate), isSameDay(parseISO(event.date), parseISO(event.endDate)) ? 'h:mm a' : 'MMM d, yyyy, h:mm a')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <MapPin size={16} className="mr-2 text-gray-400 shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Users size={16} className="mr-2 text-gray-400 shrink-0" />
                                            {event._count?.participants || 0} / {event.capacity ? event.capacity : '∞'} Joined
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 group-hover:bg-blue-50 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs font-medium text-gray-500">By {event.organizer?.name}</div>
                                        <Link to={`/events/${event.id}`} className="text-blue-600 text-sm font-semibold inline-flex items-center hover:text-blue-800 transition-colors">
                                            View Details <ChevronRight size={16} className="ml-1" />
                                        </Link>
                                    </div>

                                    {!isOrganizer && (
                                        <div className="pt-1">
                                            {isJoined ? (
                                                <button
                                                    onClick={(e) => handleJoinLeave(e, event.id, 'leave')}
                                                    disabled={isFinished}
                                                    className="w-full bg-white hover:bg-red-50 disabled:opacity-50 disabled:bg-gray-50 disabled:text-gray-400 text-red-600 text-xs font-bold py-2 px-3 border border-red-200 rounded-lg transition-all shadow-sm flex justify-center items-center"
                                                >
                                                    Leave Event
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleJoinLeave(e, event.id, 'join')}
                                                    disabled={isFull || isFinished}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 text-white text-xs font-bold py-2 px-3 rounded-lg transition-all shadow-sm flex justify-center items-center"
                                                >
                                                    {isFinished ? 'Finished' : isFull ? 'Full' : 'Join Event'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

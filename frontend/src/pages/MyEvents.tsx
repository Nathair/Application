import { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Event } from '../types';
import { formatTime, formatMonthYear, formatDayMonth, formatDateTime } from '../utils/date';
import {
    startOfWeek, addDays, startOfMonth, endOfMonth,
    endOfWeek, isSameMonth, isSameDay, addMonths, subMonths,
    addWeeks, subWeeks, parseISO, isPast, format
} from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon, Users as UsersIcon, Edit3, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { Modal, type ModalProps } from '../components/Modal';
import { getTagStyle } from '../utils/tags';
import { Button } from '../components/Button';

const EventPill = ({ ev, colorEventsByTag, navigate }: { ev: Event, colorEventsByTag: boolean, navigate: any }) => {
    const past = isPast(new Date(ev.date));
    const firstTag = ev.tags && ev.tags.length > 0 ? ev.tags[0].name : undefined;

    let style: React.CSSProperties = (colorEventsByTag && firstTag) ? getTagStyle(firstTag) : {};
    if (past) {
        style = {
            backgroundColor: '#f3f4f6',
            color: '#6b7280',
            borderColor: '#e5e7eb'
        };
    }

    return (
        <div
            onClick={(e) => { e.stopPropagation(); navigate(`/events/${ev.id}`); }}
            style={style}
            className="text-[10px] px-2 py-0.5 rounded-md cursor-pointer border truncate font-bold transition-all hover:brightness-90 shadow-sm"
            title={ev.title + (firstTag ? ` (#${firstTag})` : '')}
        >
            <span className="opacity-70 mr-1">{formatTime(ev.date)}</span>
            {ev.title}
        </div>
    );
};

export default function MyEvents() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { colorEventsByTag } = useSettingsStore();

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentDate, setCurrentDate] = useState(() => {
        const d = searchParams.get('date');
        return d ? new Date(d) : new Date();
    });
    const [view, setView] = useState<'month' | 'week' | 'list'>(() => {
        const v = searchParams.get('view');
        return (v === 'month' || v === 'week' || v === 'list') ? v : 'month';
    });
    const [temporalFilter, setTemporalFilter] = useState<'future' | 'past' | 'all'>(() => {
        const f = searchParams.get('temporal');
        return (f === 'future' || f === 'past' || f === 'all') ? f : 'future';
    });
    const [roleFilter, setRoleFilter] = useState<'all' | 'creator' | 'participant'>(() => {
        const r = searchParams.get('role');
        return (r === 'all' || r === 'creator' || r === 'participant') ? r : 'all';
    });
    const [modal, setModal] = useState<{
        open: boolean; type: ModalProps['type']; title: string; message: string; onConfirm?: () => void;
    }>({ open: false, type: 'info', title: '', message: '' });

    const showModal = (type: ModalProps['type'], title: string, message: string, onConfirm?: () => void) => {
        setModal({ open: true, type, title, message, onConfirm });
    };

    useEffect(() => {
        const currentView = searchParams.get('view');
        const currentRole = searchParams.get('role');
        const currentTemporal = searchParams.get('temporal');
        const currentDateStr = searchParams.get('date');

        // Use a stable date format (Y-M-D) or just toISOString but compare carefully
        const newDateStr = currentDate.toISOString();

        const needsUpdate = view !== currentView ||
            roleFilter !== currentRole ||
            temporalFilter !== currentTemporal ||
            (currentDateStr && new Date(currentDateStr).getTime() !== currentDate.getTime());

        if (needsUpdate) {
            setSearchParams({
                view,
                role: roleFilter,
                temporal: temporalFilter,
                date: newDateStr
            }, { replace: true });
        }
    }, [view, roleFilter, temporalFilter, currentDate, setSearchParams, searchParams]);

    const fetchEvents = (silent = false) => {
        if (!silent) setLoading(true);
        api.get('/users/me/events')
            .then(res => setEvents(res.data))
            .catch(console.error)
            .finally(() => {
                if (!silent) setLoading(false);
            });
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleLeave = async (eventId: number) => {
        try {
            await api.post(`/events/${eventId}/leave`);
            fetchEvents(true); // Silent update
        } catch (err: any) {
            showModal('error', 'Error', err.response?.data?.message || 'Failed to leave event');
        }
    };

    const handleJoin = async (eventId: number) => {
        try {
            await api.post(`/events/${eventId}/join`);
            fetchEvents(true); // Silent update
        } catch (err: any) {
            showModal('error', 'Error', err.response?.data?.message || 'Failed to join event');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    if (events.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CalendarIcon size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Your Calendar is Empty</h2>
                    <p className="text-gray-500 mb-8 text-lg">You are not part of any events yet.</p>
                    <Button onClick={() => navigate('/')} className="w-full" size="lg">
                        Explore Public Events
                    </Button>
                </div>
            </div>
        );
    }


    const filteredEvents = events.filter(ev => {
        if (roleFilter === 'creator') return ev.organizerId === user?.id;
        if (roleFilter === 'participant') return ev.participants?.some(p => p.user.id === user?.id);
        return true;
    });

    const eventsOnDay = (day: Date) =>
        filteredEvents.filter(e => isSameDay(parseISO(e.date), day));

    // ── Month View ──────────────────────────────────────────────────────────────
    const renderMonth = () => {
        const monthStart = startOfMonth(currentDate);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(endOfMonth(monthStart));
        const dayNames = Array.from({ length: 7 }, (_, i) => format(addDays(startOfWeek(monthStart), i), 'EEE'));

        const rows = [];
        let day = startDate;
        while (day <= endDate) {
            const week = [];
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvs = eventsOnDay(cloneDay);
                const isToday = isSameDay(cloneDay, new Date());
                week.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[130px] px-2 py-2 border-r border-b border-gray-100 ${!isSameMonth(cloneDay, monthStart) ? 'bg-gray-50/50 text-gray-400' : isToday ? 'bg-blue-50/40' : 'bg-white hover:bg-gray-50/50'}`}
                    >
                        <div className="flex justify-end pr-1 mb-1">
                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-blue-600 text-white shadow' : 'text-gray-700'}`}>
                                {format(cloneDay, 'd')}
                            </span>
                        </div>
                        <div className="space-y-1">
                            {dayEvs.slice(0, 3).map(ev => <EventPill key={ev.id} ev={ev} colorEventsByTag={colorEventsByTag} navigate={navigate} />)}
                            {dayEvs.length > 3 && (
                                <p className="text-xs text-gray-400 font-medium px-1">+{dayEvs.length - 3} more</p>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(<div key={day.toString()} className="grid grid-cols-7">{week}</div>);
        }

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {dayNames.map(d => (
                        <div key={d} className="py-2.5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">{d}</div>
                    ))}
                </div>
                {rows}
            </div>
        );
    };

    // ── Week View ───────────────────────────────────────────────────────────────
    const renderWeek = () => {
        const weekStart = startOfWeek(currentDate);
        const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {days.map(day => {
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div key={day.toString()} className={`text-center py-3 border-r last:border-r-0 border-gray-100 ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{format(day, 'EEE')}</p>
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto mt-1 text-sm font-bold ${isToday ? 'bg-blue-600 text-white shadow' : 'text-gray-800'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="grid grid-cols-7 divide-x divide-gray-100 min-h-[400px]">
                    {days.map(day => {
                        const dayEvs = eventsOnDay(day);
                        return (
                            <div key={day.toString()} className="p-2 space-y-1.5">
                                {dayEvs.length === 0 ? (
                                    <p className="text-xs text-gray-300 text-center mt-4">–</p>
                                ) : (
                                    dayEvs.map(ev => <EventPill key={ev.id} ev={ev} colorEventsByTag={colorEventsByTag} navigate={navigate} />)
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ── List View ───────────────────────────────────────────────────────────────
    const renderList = () => {
        const filtered = filteredEvents.filter(ev => {
            if (temporalFilter === 'future') return !isPast(new Date(ev.date));
            if (temporalFilter === 'past') return isPast(new Date(ev.date));
            return true;
        }).sort((a, b) => {
            // Future: earliest first; Past: latest first
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return temporalFilter === 'past' ? dateB - dateA : dateA - dateB;
        });

        return (
            <div className="space-y-4">
                <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200 w-fit">
                    {(['future', 'past', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setTemporalFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${temporalFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No {temporalFilter} events found.</div>
                    ) : (
                        filtered.map(ev => {
                            const isOrganizer = ev.organizerId === user?.id;
                            const isParticipant = ev.participants?.some(p => p.user.id === user?.id);
                            const past = isPast(new Date(ev.date));

                            const cardStyle = (colorEventsByTag && ev.tags && ev.tags.length > 0 && !past)
                                ? { ...getTagStyle(ev.tags[0].name), borderLeftWidth: '4px' }
                                : {};

                            return (
                                <div
                                    key={ev.id}
                                    style={cardStyle}
                                    className={`p-6 hover:brightness-95 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 last:border-b-0`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="bg-white/50 backdrop-blur-sm border border-black/5 rounded-xl p-3 flex flex-col items-center min-w-[80px] text-gray-700 shrink-0 shadow-sm">
                                            <span className="text-xs font-bold uppercase tracking-wider">{format(new Date(ev.date), 'MMM')}</span>
                                            <span className="text-2xl font-black">{format(new Date(ev.date), 'dd')}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 cursor-pointer hover:underline" onClick={() => navigate(`/events/${ev.id}`)}>
                                                {ev.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mt-1">
                                                <span className="flex items-start">
                                                    <Clock size={14} className="mr-1.5 mt-0.5 shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span>{formatTime(ev.date)}</span>
                                                        {ev.endDate && (
                                                            <span className="text-xs opacity-70">
                                                                – {isSameDay(parseISO(ev.date), parseISO(ev.endDate)) ? formatTime(ev.endDate) : formatDateTime(ev.endDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </span>
                                                <span className="flex items-center"><MapPin size={14} className="mr-1.5" />{ev.location}</span>
                                            </div>
                                            {/* Tags in list view */}
                                            {ev.tags && ev.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {ev.tags.map(tag => (
                                                        <span
                                                            key={tag.id}
                                                            style={getTagStyle(tag.name)}
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tight shadow-sm`}
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 md:justify-end">
                                        {isOrganizer && !past && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={(e) => { e.stopPropagation(); navigate(`/create-event?edit=${ev.id}`); }}
                                                icon={<Edit3 size={14} />}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                        {!past && (
                                            isParticipant ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleLeave(ev.id); }}
                                                    icon={<LogOut size={14} />}
                                                    className="!text-red-600 !border-red-200 hover:!bg-red-50"
                                                >
                                                    Leave
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleJoin(ev.id); }}
                                                    icon={<UsersIcon size={14} />}
                                                >
                                                    Join
                                                </Button>
                                            )
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/events/${ev.id}`)}
                                            className="!text-blue-600 hover:!bg-blue-50"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    // ── Navigation title ────────────────────────────────────────────────────────
    const navTitle = view === 'month'
        ? formatMonthYear(currentDate)
        : view === 'week'
            ? `${formatDayMonth(startOfWeek(currentDate))} – ${formatDayMonth(endOfWeek(currentDate))}, ${format(endOfWeek(currentDate), 'yyyy')}`
            : 'All Events';

    const prev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    };
    const next = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    };

    return (
        <div className="space-y-6">
            <div className="pb-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Events</h1>
                <p className="text-gray-500 mt-1">Manage events you joined or organized.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">{navTitle}</h2>

                    {/* Role Filter Tabs */}
                    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200 w-fit">
                        <button
                            onClick={() => setRoleFilter('all')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${roleFilter === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setRoleFilter('creator')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${roleFilter === 'creator' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <UserIcon size={14} /> Organized
                        </button>
                        <button
                            onClick={() => setRoleFilter('participant')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${roleFilter === 'participant' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <UsersIcon size={14} /> Joined
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap min-h-[80px] self-end">
                    {/* View switcher */}
                    <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                        {(['month', 'week', 'list'] as const).map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 py-1.5 rounded-md text-sm font-semibold capitalize transition-colors ${view === v ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* Date navigation (hidden for list view) */}
                    {view !== 'list' && (
                        <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={prev} className="!p-2">
                                <ChevronLeft size={18} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                                Today
                            </Button>
                            <Button variant="outline" size="sm" onClick={next} className="!p-2">
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {view === 'month' && renderMonth()}
            {view === 'week' && renderWeek()}
            {view === 'list' && renderList()}

            <Modal
                isOpen={modal.open}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                confirmLabel="Yes, proceed"
                onConfirm={modal.onConfirm}
                onClose={() => setModal(m => ({ ...m, open: false }))}
            />
        </div>
    );
}

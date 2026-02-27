import { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Event } from '../types';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

export default function MyEvents() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [view, setView] = useState<'month' | 'list'>('month');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/users/me/events');
                setEvents(res.data);
            } catch (err) {
                console.error("Failed to fetch my events", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    if (events.length === 0) {
        return (
            <div className="flex justify-center items-center py-20 animate-in fade-in">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg text-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CalendarIcon size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Your Calendar is Empty</h2>
                    <p className="text-gray-500 mb-8 text-lg">You are not part of any events yet. Explore public events and join.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm flex justify-center items-center"
                    >
                        Explore Public Events
                    </button>
                </div>
            </div>
        );
    }

    // Calendar logic
    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 rounded-lg p-1 mr-4 border border-gray-200">
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Calendar
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            List
                        </button>
                    </div>
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors bg-white shadow-sm">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors bg-white shadow-sm">
                        Today
                    </button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors bg-white shadow-sm">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        // Days header
        const daysHeader = [];
        let startD = startOfWeek(currentMonth);
        for (let i = 0; i < 7; i++) {
            daysHeader.push(
                <div className="font-semibold text-center py-3 text-sm text-gray-600 uppercase tracking-wider bg-gray-50 border-b border-gray-100" key={i}>
                    {format(addDays(startD, i), 'EEE')}
                </div>
            );
        }

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                // Find events for this day
                const dayEvents = events.filter(e => isSameDay(parseISO(e.date), cloneDay));
                const isToday = isSameDay(day, new Date());

                days.push(
                    <div
                        className={`min-h-[140px] px-2 py-3 border-r border-b border-gray-100 transition-colors ${!isSameMonth(day, monthStart)
                            ? "bg-gray-50/50 text-gray-400"
                            : isToday ? "bg-blue-50/30" : "bg-white text-gray-900 hover:bg-gray-50/50"
                            }`}
                        key={day.toString()}
                    >
                        <div className="flex justify-end pr-2">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${isToday ? 'bg-blue-600 text-white shadow-md' : ''}`}>
                                {formattedDate}
                            </span>
                        </div>
                        <div className="mt-2 space-y-1.5 flex flex-col px-1">
                            {dayEvents.map(ev => {
                                const past = isPast(new Date(ev.date));
                                return (
                                    <div
                                        key={ev.id}
                                        onClick={() => navigate(`/events/${ev.id}`)}
                                        className={`text-xs px-2 py-1.5 rounded-md cursor-pointer border truncate font-medium transition-transform hover:-translate-y-0.5 shadow-sm ${past
                                            ? 'bg-gray-100 text-gray-600 border-gray-200 opacity-70'
                                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                            }`}
                                        title={ev.title}
                                    >
                                        <span className="opacity-70 mr-1">{format(new Date(ev.date), 'HH:mm')}</span>
                                        {ev.title}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-200">
                    {daysHeader}
                </div>
                <div>
                    {rows}
                </div>
            </div>
        );
    };

    const renderListView = () => {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {events.map((ev) => (
                        <div key={ev.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col items-center justify-center min-w-[80px] text-blue-700 shrink-0 shadow-sm">
                                    <span className="text-xs font-bold uppercase tracking-wider">{format(new Date(ev.date), 'MMM')}</span>
                                    <span className="text-2xl font-black">{format(new Date(ev.date), 'dd')}</span>
                                </div>
                                <div>
                                    <h3
                                        className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors mb-1"
                                        onClick={() => navigate(`/events/${ev.id}`)}
                                    >
                                        {ev.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mt-2">
                                        <span className="flex items-center"><Clock size={16} className="mr-1.5 shrink-0" /> {format(new Date(ev.date), 'h:mm a')}</span>
                                        <span className="flex items-center"><MapPin size={16} className="mr-1.5 shrink-0" /> {ev.location}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/events/${ev.id}`)}
                                className="btn-secondary whitespace-nowrap md:self-center w-full md:w-auto mt-4 md:mt-0"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="pb-4">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Events</h1>
                <p className="text-lg text-gray-600 mt-2">Manage all the events you have joined or organized.</p>
            </div>

            {renderHeader()}
            {view === 'month' ? renderCells() : renderListView()}
        </div>
    );
}

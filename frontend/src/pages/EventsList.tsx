import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Event } from '../types';
import { format } from 'date-fns';
import { MapPin, Users, Calendar, Clock, ChevronRight } from 'lucide-react';

export default function EventsList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

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
        fetchEvents();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Discover Events</h1>
                    <p className="text-lg text-gray-600">Find and join the best events happening around you.</p>
                </div>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-500">There are currently no public events available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const isFull = event.capacity && event._count && (event._count.participants >= event.capacity);

                        return (
                            <div key={event.id} className="group bg-white flex flex-col justify-between rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 tracking-wide">
                                            {format(new Date(event.date), 'MMM d, yyyy')}
                                        </span>
                                        {isFull && (
                                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 mb-2">
                                                Full
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {event.title}
                                    </h3>

                                    <p className="text-gray-600 mb-6 line-clamp-2 text-sm">
                                        {event.description || "No description provided."}
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock size={16} className="mr-2 text-gray-400 shrink-0" />
                                            {format(new Date(event.date), 'h:mm a')}
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

                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
                                    <div className="text-xs font-medium text-gray-500">
                                        By {event.organizer?.name}
                                    </div>
                                    <Link
                                        to={`/events/${event.id}`}
                                        className="text-blue-600 text-sm font-semibold inline-flex items-center hover:text-blue-800 transition-colors"
                                    >
                                        View Details <ChevronRight size={16} className="ml-1" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

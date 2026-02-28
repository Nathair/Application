import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import type { Event } from '../types';
import { format } from 'date-fns';
import { MapPin, Users, CalendarDays, Clock, ShieldCheck, ArrowLeft, Trash2, Edit3 } from 'lucide-react';

export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuthStore();

    const fetchEvent = async () => {
        try {
            const res = await api.get(`/events/${id}`);
            setEvent(res.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const handleJoinLeave = async (action: 'join' | 'leave') => {
        if (!isAuthenticated) return navigate('/login');
        try {
            await api.post(`/events/${id}/${action}`);
            fetchEvent();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error executing action');
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await api.delete(`/events/${id}`);
                navigate('/my-events');
            } catch (err) {
                alert("Failed to delete the event");
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    if (!event) return null;

    const isOrganizer = user?.id === event.organizerId;
    const isParticipant = event.participants?.some(p => p.user.id === user?.id);
    const currentParticipants = event.participants?.length || 0;
    const isFull = event.capacity ? currentParticipants >= event.capacity : false;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={() => navigate(-1)}
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-6 transition-colors"
            >
                <ArrowLeft size={16} className="mr-1" /> Back
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 md:h-48 flex items-end">
                    <div className="p-8 w-full text-white">
                        <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold tracking-wide uppercase mb-3 border border-white/10">
                            {event.visibility}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{event.title}</h1>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">About this event</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                                    {event.description || "No description provided."}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Participants ({currentParticipants})</h3>
                                <div className="flex flex-wrap gap-2">
                                    {event.participants && event.participants.length > 0 ? (
                                        event.participants.map((p, i) => (
                                            <span key={i} className="inline-flex items-center justify-center bg-gray-100 border border-gray-200 text-gray-800 rounded-full px-4 py-2 text-sm shadow-sm transition-transform hover:scale-105">
                                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2 font-bold text-[10px] uppercase">
                                                    {p.user.name.charAt(0)}
                                                </span>
                                                {p.user.name}
                                            </span>
                                        ))
                                    ) : <p className="text-gray-500 italic">No one has joined yet.</p>}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-5 shadow-sm">
                                <div className="flex items-start text-gray-700">
                                    <CalendarDays className="mr-3 text-blue-500 mt-0.5 shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                            <Clock size={14} className="mr-1" /> {format(new Date(event.date), 'h:mm a')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start text-gray-700">
                                    <MapPin className="mr-3 text-red-500 mt-0.5 shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold">Location</p>
                                        <p className="text-sm text-gray-500 leading-snug">{event.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-start text-gray-700">
                                    <ShieldCheck className="mr-3 text-green-500 mt-0.5 shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold">Organizer</p>
                                        <p className="text-sm text-gray-500">{event.organizer.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start text-gray-700">
                                    <Users className="mr-3 text-purple-500 mt-0.5 shrink-0" size={20} />
                                    <div>
                                        <p className="font-semibold">Capacity</p>
                                        <p className="text-sm text-gray-500">
                                            {currentParticipants} / {event.capacity ? event.capacity : '∞'} Joined
                                            {isFull && <span className="ml-2 text-red-600 font-medium">(Full)</span>}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!isOrganizer && (
                                <div className="pt-2">
                                    {isParticipant ? (
                                        <button
                                            onClick={() => handleJoinLeave('leave')}
                                            className="w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-3 px-4 border-2 border-red-200 rounded-xl transition-all shadow-sm flex justify-center items-center"
                                        >
                                            Leave Event
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinLeave('join')}
                                            disabled={isFull}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:shadow-none flex justify-center items-center text-lg"
                                        >
                                            {isFull ? 'Event is Full' : 'Join Event'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {isOrganizer && (
                                <div className="pt-2 flex flex-col gap-3">
                                    <button onClick={() => navigate(`/create-event?edit=${id}`)} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-3 px-4 rounded-xl transition-all border border-indigo-200 flex justify-center items-center">
                                        <Edit3 size={18} className="mr-2" /> Edit Details
                                    </button>
                                    <button onClick={handleDelete} className="w-full bg-white hover:bg-red-50 text-red-600 font-semibold py-3 px-4 border-2 border-red-200 rounded-xl transition-all shadow-sm flex justify-center items-center">
                                        <Trash2 size={18} className="mr-2" /> Delete Event
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

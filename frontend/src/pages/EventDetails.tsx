import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import type { Event } from '../types';
import { formatDate, formatTime } from '../utils/date';
import { isSameDay, parseISO, isBefore } from 'date-fns';
import { MapPin, Users, CalendarDays, Clock, ShieldCheck, ArrowLeft, Trash2, Edit3, AlertCircle, Tag as TagIcon } from 'lucide-react';
import { Modal, type ModalProps } from '../components/Modal';
import { getTagStyle } from '../utils/tags';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from '../components/Button';

// ── Main Component ─────────────────────────────────────────────────────────────
export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuthStore();
    const { colorEventsByTag } = useSettingsStore();

    // Modal state
    const [modal, setModal] = useState<{
        open: boolean; type: ModalProps['type']; title: string; message: string; onConfirm?: () => void;
    }>({ open: false, type: 'info', title: '', message: '' });

    const showModal = (type: ModalProps['type'], title: string, message: string, onConfirm?: () => void) => {
        setModal({ open: true, type, title, message, onConfirm });
    };

    const fetchEvent = useCallback(async () => {
        try {
            const res = await api.get(`/events/${id}`);
            setEvent(res.data);
        } catch (err: any) {
            if (err.response?.status === 404) navigate('/');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    const handleJoinLeave = async (action: 'join' | 'leave') => {
        if (!isAuthenticated) return navigate('/login');
        try {
            await api.post(`/events/${id}/${action}`);
            await fetchEvent(); // always refresh after action
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error executing action';
            // If event is full, also refresh to update the UI
            if (msg.toLowerCase().includes('full')) {
                await fetchEvent();
            }
            showModal('error', action === 'join' ? 'Cannot Join' : 'Cannot Leave', msg);
        }
    };

    const handleDelete = () => {
        showModal('confirm', 'Delete Event', 'Are you sure you want to delete this event?', async () => {
            try {
                await api.delete(`/events/${id}`);
                navigate('/my-events');
            } catch {
                showModal('error', 'Error', 'Failed to delete the event. Please try again.');
            }
        });
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    if (!event) return null;

    const isOrganizer = user?.id === event.organizerId;
    const isParticipant = event.participants?.some(p => p.user.id === user?.id);
    const currentParticipants = event.participants?.length || 0;
    const isFull = event.capacity ? currentParticipants >= event.capacity : false;
    const isFinished = isBefore(parseISO(event.date), new Date());

    return (
        <>
            <Modal
                isOpen={modal.open}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                confirmLabel="Yes, proceed"
                onConfirm={modal.onConfirm}
                onClose={() => setModal(m => ({ ...m, open: false }))}
            />

            <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    icon={<ArrowLeft size={16} />}
                    className="mb-6 !text-gray-500 hover:!text-gray-900"
                >
                    Back
                </Button>

                <div
                    style={(colorEventsByTag && event.tags && event.tags.length > 0 && !isFinished) ? getTagStyle(event.tags[0].name) : {}}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500"
                >
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
                                    <h3 className={`text-xl font-bold text-gray-900 border-b border-black/5 pb-2 mb-4`}>About this event</h3>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">
                                        {event.description || "No description provided."}
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 border-b border-black/5 pb-2 mb-4">Participants ({currentParticipants})</h3>
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
                                <div className={`p-6 rounded-xl border border-black/5 space-y-5 shadow-sm ${(colorEventsByTag && !isFinished && event.tags && event.tags.length > 0) ? 'bg-white/30 backdrop-blur-sm' : 'bg-gray-50'}`}>

                                    <div className="flex items-start text-gray-700">
                                        <CalendarDays className="mr-3 text-blue-500 mt-0.5 shrink-0" size={20} />
                                        <div>
                                            <p className="font-semibold text-lg">
                                                {formatDate(event.date)}
                                            </p>
                                            <div className="text-gray-600 flex flex-col mt-1">
                                                <div className="flex items-center">
                                                    <Clock size={16} className="mr-2 text-gray-400" />
                                                    <span className="font-medium text-gray-900">{formatTime(event.date)}</span>
                                                    {event.endDate && isSameDay(parseISO(event.date), parseISO(event.endDate)) && (
                                                        <span className="ml-1">– {formatTime(event.endDate)}</span>
                                                    )}
                                                </div>
                                                {event.endDate && !isSameDay(parseISO(event.date), parseISO(event.endDate)) && (
                                                    <div className="flex items-center mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 text-sm">
                                                        <span className="font-bold mr-2 text-blue-500">ENDS:</span>
                                                        {formatDate(event.endDate)} @ {formatTime(event.endDate)}
                                                    </div>
                                                )}
                                            </div>
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

                                    {event.tags && event.tags.length > 0 && (
                                        <div className="flex items-start text-gray-700">
                                            <TagIcon className="mr-3 text-indigo-500 mt-0.5 shrink-0" size={20} />
                                            <div>
                                                <p className="font-semibold mb-2">Tags</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {event.tags.map(tag => (
                                                        <span
                                                            key={tag.id}
                                                            style={getTagStyle(tag.name)}
                                                            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border uppercase tracking-tight shadow-sm"
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {isFinished && (
                                        <div className="mt-2 p-3 bg-gray-100 rounded-xl border border-gray-200 flex items-center gap-2 text-gray-600 font-bold text-sm">
                                            <AlertCircle size={18} className="text-gray-400" />
                                            This event has finished
                                        </div>
                                    )}
                                </div>

                                {/* Join/Leave */}
                                <div className="pt-2">
                                    {isParticipant ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleJoinLeave('leave')}
                                            disabled={isFinished}
                                            className="w-full !text-red-600 !border-red-200 hover:!bg-red-50"
                                        >
                                            Leave Event
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleJoinLeave('join')}
                                            disabled={isFull || isFinished}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {isFinished ? 'Event Finished' : isFull ? 'Event is Full' : 'Join Event'}
                                        </Button>
                                    )}
                                </div>

                                {/* Organizer actions */}
                                {isOrganizer && (
                                    <div className="pt-4 mt-2 border-t border-gray-200 flex flex-col gap-3">
                                        {!isFinished && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => navigate(`/create-event?edit=${id}`)}
                                                icon={<Edit3 size={18} />}
                                                className="w-full"
                                            >
                                                Edit Details
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            onClick={handleDelete}
                                            icon={<Trash2 size={18} />}
                                            className="w-full !text-red-600 !border-red-200 hover:!bg-red-50"
                                        >
                                            Delete Event
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

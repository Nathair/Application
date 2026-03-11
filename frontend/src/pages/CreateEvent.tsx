import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Calendar as CalendarIcon, MapPin, AlignLeft, Users, Type, Eye, Tag as TagIcon, X, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { isSameDay, isBefore } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import { Modal, type ModalProps } from '../components/Modal';
import { getTagStyle } from '../utils/tags';
import { type Tag } from '../types';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Save, Send } from 'lucide-react';

const roundToNext15Minutes = (date: Date) => {
    const minutes = 15;
    const ms = 1000 * 60 * minutes;
    return new Date(Math.ceil(date.getTime() / ms) * ms);
};

const schema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string().optional(),
    date: yup.date()
        .min(new Date(new Date().getTime() + 14 * 60 * 1000), 'Event must start at least 15 minutes from now')
        .required('Start date and time are required')
        .typeError('Invalid date/time format'),
    endDate: yup.date()
        .nullable()
        .optional()
        .typeError('Invalid date/time format')
        .test('is-after-start', 'End date must be at least 15 minutes after start date', function (value) {
            const { date } = this.parent;
            if (!value || !date) return true;
            const minEnd = new Date(new Date(date).getTime() + 15 * 60 * 1000);
            return value >= minEnd;
        }),
    location: yup.string().required('Location is required'),
    capacity: yup.number()
        .nullable()
        .transform((value, originalValue) => String(originalValue).trim() === '' ? null : value)
        .min(1, 'Capacity must be at least 1')
        .optional(),
    visibility: yup.string().oneOf(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
    tags: yup.array().of(yup.string().required()).max(5, 'Maximum 5 tags allowed').optional(),
});

export default function CreateEvent() {
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const { register, handleSubmit, formState: { errors }, setValue, control, watch } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            visibility: 'PUBLIC',
            capacity: null,
            tags: [],
            date: roundToNext15Minutes(new Date(new Date().getTime() + 15 * 60 * 1000)) as any
        }
    });

    const startDate = watch('date');
    const tags = watch('tags') || [];

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(!!editId);
    const [tagInput, setTagInput] = useState('');
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const tagContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { colorEventsByTag } = useSettingsStore();

    // Modal state
    const [modal, setModal] = useState<{
        open: boolean; type: ModalProps['type']; title: string; message: string; onConfirm?: () => void;
    }>({ open: false, type: 'info', title: '', message: '' });

    const showModal = (type: ModalProps['type'], title: string, message: string, onConfirm?: () => void) => {
        setModal({ open: true, type, title, message, onConfirm });
    };

    useEffect(() => {
        // Fetch all available tags for autocomplete
        api.get('/events/tags').then(res => setAllTags(res.data)).catch(console.error);

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (tagContainerRef.current && !tagContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (editId) {
            api.get(`/events/${editId}`).then(res => {
                const ev = res.data;
                const isFinished = isBefore(new Date(ev.date), new Date());

                if (isFinished) {
                    navigate(`/events/${editId}`);
                    return;
                }

                setValue('title', ev.title);
                setValue('description', ev.description || '');
                setValue('date', new Date(ev.date) as any);
                if (ev.endDate) setValue('endDate', new Date(ev.endDate) as any);
                setValue('location', ev.location);
                setValue('capacity', ev.capacity);
                setValue('visibility', ev.visibility);
                setValue('tags', (ev.tags || []).map((t: any) => t.name));
                setPageLoading(false);
            }).catch(() => {
                showModal('error', 'Error', 'Failed to load event for editing');
                setTimeout(() => navigate('/my-events'), 2000);
            });
        }
    }, [editId, setValue, navigate]);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = tagInput.trim().replace(/,/g, '');
            if (val && val.length < 2) return; // Min 2 chars
            if (val && tags.length < 5 && !tags.includes(val)) {
                setValue('tags', [...tags, val]);
                setTagInput('');
                setShowSuggestions(false);
            }
        }
    };

    const selectSuggestedTag = (tagName: string) => {
        if (tags.length < 5 && !tags.includes(tagName)) {
            setValue('tags', [...tags, tagName]);
            setTagInput('');
            setShowSuggestions(false);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue('tags', tags.filter(t => t !== tagToRemove));
    };

    const filteredSuggestions = allTags.filter(t =>
        t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tags.includes(t.name)
    );

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            if (editId) {
                await api.patch(`/events/${editId}`, data);
                navigate(`/events/${editId}`);
            } else {
                const res = await api.post('/events', data);
                navigate(`/events/${res.data.id}`);
            }
        } catch (err: any) {
            showModal('error', 'Error', err.response?.data?.message || 'Error processing request');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    const datepickerClass = "input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors w-full";

    return (
        <>
            <Modal
                isOpen={modal.open}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onClose={() => setModal(m => ({ ...m, open: false }))}
            />
            <div className="max-w-2xl mx-auto py-8">
                <div
                    style={(colorEventsByTag && tags.length > 0) ? getTagStyle(tags[0]) : {}}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500"
                >
                    <div className={`p-8 border-b border-gray-100 ${(colorEventsByTag && tags.length > 0) ? 'bg-white/30 backdrop-blur-sm' : 'bg-gray-50/50'}`}>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {editId ? 'Edit Event Details' : 'Create New Event'}
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">
                            {editId ? 'Update your event information below.' : 'Fill in the details to host a new event.'}
                        </p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Title */}
                            <Input
                                label="Event Title *"
                                icon={<Type size={16} />}
                                placeholder="e.g. Summer Tech Meetup 2026"
                                error={errors.title?.message as string}
                                {...register('title')}
                            />

                            {/* Description */}
                            <Textarea
                                label="Description"
                                icon={<AlignLeft size={16} />}
                                placeholder="What is this event about?"
                                rows={4}
                                {...register('description')}
                            />

                            {/* Start Date (required) + End Date (optional) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                                        <CalendarIcon size={16} className="mr-2 text-gray-400" /> Start Date & Time *
                                    </label>
                                    <Controller
                                        control={control}
                                        name="date"
                                        render={({ field }) => (
                                            <DatePicker
                                                placeholderText="Select start date & time"
                                                onChange={(date: Date | null) => {
                                                    if (date) {
                                                        field.onChange(roundToNext15Minutes(date));
                                                    } else {
                                                        field.onChange(null);
                                                    }
                                                }}
                                                selected={field.value as any}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={15}
                                                timeCaption="time"
                                                dateFormat="MMM d, yyyy h:mm aa"
                                                className={datepickerClass}
                                                wrapperClassName="w-full"
                                                minDate={new Date()}
                                                minTime={isSameDay(new Date(), field.value ? new Date(field.value as any) : new Date())
                                                    ? new Date(new Date().getTime() + 15 * 60 * 1000)
                                                    : new Date(new Date().setHours(0, 0, 0, 0))}
                                                maxTime={new Date(new Date().setHours(23, 45, 0, 0))}
                                            />
                                        )}
                                    />
                                    {errors.date?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.date.message)}</p>}
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                                        <CalendarIcon size={16} className="mr-2 text-gray-400" /> End Date & Time <span className="ml-1 text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <Controller
                                        control={control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <DatePicker
                                                placeholderText="Select end date & time"
                                                onChange={(date: Date | null) => {
                                                    if (date) {
                                                        field.onChange(roundToNext15Minutes(date));
                                                    } else {
                                                        field.onChange(null);
                                                    }
                                                }}
                                                selected={field.value as any}
                                                showTimeSelect
                                                timeFormat="HH:mm"
                                                timeIntervals={15}
                                                timeCaption="time"
                                                dateFormat="MMM d, yyyy h:mm aa"
                                                className={datepickerClass}
                                                wrapperClassName="w-full"
                                                isClearable
                                                minDate={startDate ? new Date(startDate) : new Date()}
                                                minTime={startDate && isSameDay(new Date(startDate), field.value ? new Date(field.value as any) : new Date(startDate))
                                                    ? new Date(new Date(startDate).getTime() + 15 * 60 * 1000)
                                                    : new Date(new Date().setHours(0, 0, 0, 0))}
                                                maxTime={new Date(new Date().setHours(23, 45, 0, 0))}
                                            />
                                        )}
                                    />
                                    {errors.endDate?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.endDate.message)}</p>}
                                </div>
                            </div>

                            {/* Location */}
                            <Input
                                label="Location *"
                                icon={<MapPin size={16} />}
                                placeholder="e.g. 123 Main St, City"
                                error={errors.location?.message as string}
                                {...register('location')}
                            />

                            {/* Capacity */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                                    <Users size={16} className="mr-2 text-gray-400" /> Capacity (Optional)
                                </label>
                                <Controller
                                    control={control}
                                    name="capacity"
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            value={field.value ?? ''}
                                            onKeyDown={(e) => {
                                                if (!/^\d$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={e => {
                                                const raw = e.target.value;
                                                const val = raw === '' ? null : parseInt(raw, 10);
                                                if (val !== null && val < 1) {
                                                    field.onChange(null);
                                                } else {
                                                    field.onChange(val);
                                                }
                                            }}
                                            placeholder={!field.value && field.value !== 0 ? "Set visitor limit or leave for no limit" : ""}
                                            error={errors.capacity?.message as string}
                                        />
                                    )}
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                                    <TagIcon size={16} className="mr-2 text-gray-400" /> Tags (Max 5)
                                </label>
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2 min-h-[32px]">
                                        {tags.map((tag: string) => {
                                            const style = getTagStyle(tag);
                                            return (
                                                <span
                                                    key={tag}
                                                    style={style}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-tight shadow-sm"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="hover:opacity-70 transition-colors ml-1"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                        {tags.length === 0 && <span className="text-gray-400 text-sm italic">No tags added yet.</span>}
                                    </div>
                                    <div className="space-y-2" ref={tagContainerRef}>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={e => {
                                                    setTagInput(e.target.value);
                                                    setShowSuggestions(true);
                                                }}
                                                onFocus={() => setShowSuggestions(true)}
                                                onKeyDown={handleAddTag}
                                                placeholder={tags.length < 5 ? "Type a tag and press Enter..." : "Maximum tags reached"}
                                                disabled={tags.length >= 5}
                                                className="input-field py-3 pl-4 pr-10 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                                            />

                                            {tags.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSuggestions(!showSuggestions)}
                                                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-blue-500 transition-colors"
                                                >
                                                    <ChevronDown size={20} className={`transition-transform duration-200 ${showSuggestions ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}

                                            {showSuggestions && filteredSuggestions.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto max-h-60 py-1 animate-in fade-in slide-in-from-top-1 custom-scrollbar">
                                                    {filteredSuggestions.map(tag => (
                                                        <button
                                                            key={tag.id}
                                                            type="button"
                                                            onClick={() => {
                                                                selectSuggestedTag(tag.name);
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors flex justify-between items-center"
                                                        >
                                                            <span>{tag.name}</span>
                                                            <span className="text-[10px] text-gray-400 uppercase font-bold">Suggested</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-[10px] text-gray-400 flex justify-between px-1">
                                            <span>Press Enter or comma to add tag. Min 2 characters.</span>
                                            {tagInput.length > 0 && tagInput.length < 2 && (
                                                <span className="text-amber-500 font-bold">Too short ({tagInput.length}/2)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {errors.tags?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.tags.message)}</p>}
                            </div>

                            {/* Visibility with explanations */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                    <Eye size={16} className="mr-2 text-gray-400" /> Visibility
                                </label>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <label className="flex-1 flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                                        <input type="radio" value="PUBLIC" {...register('visibility')} className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer" />
                                        <span className="text-sm text-gray-700 leading-snug">
                                            <span className="font-semibold text-gray-900 block">Public</span>
                                            <span className="text-gray-500 text-xs">Visible to all users on the Events page</span>
                                        </span>
                                    </label>
                                    <label className="flex-1 flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all">
                                        <input type="radio" value="PRIVATE" {...register('visibility')} className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer" />
                                        <span className="text-sm text-gray-700 leading-snug">
                                            <span className="font-semibold text-gray-900 block">Private</span>
                                            <span className="text-gray-500 text-xs">Only accessible via direct link</span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    icon={editId ? <Save size={18} /> : <Send size={18} />}
                                >
                                    {editId ? 'Save Changes' : 'Publish Event'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

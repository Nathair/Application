import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Calendar as CalendarIcon, MapPin, AlignLeft, Users, Type, Eye } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { isSameDay, isBefore } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

const schema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string().optional(),
    date: yup.date()
        .min(new Date(), 'Cannot create events in the past')
        .required('Start date and time are required')
        .typeError('Invalid date/time format'),
    endDate: yup.date()
        .nullable()
        .optional()
        .typeError('Invalid date/time format')
        .test('is-after-start', 'End date must be after start date', function (value) {
            const { date } = this.parent;
            if (!value || !date) return true;
            return value > date;
        }),
    location: yup.string().required('Location is required'),
    capacity: yup.number()
        .nullable()
        .transform((value, originalValue) => String(originalValue).trim() === '' ? null : value)
        .min(1, 'Capacity must be at least 1')
        .optional(),
    visibility: yup.string().oneOf(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});

export default function CreateEvent() {
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const { register, handleSubmit, formState: { errors }, setValue, control, watch } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { visibility: 'PUBLIC', capacity: null }
    });

    const startDate = watch('date');

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(!!editId);
    const navigate = useNavigate();

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
                setPageLoading(false);
            }).catch(() => {
                alert("Failed to load event for editing");
                navigate('/my-events');
            });
        }
    }, [editId, setValue, navigate]);

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
            alert(err.response?.data?.message || 'Error processing request');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
    }

    const datepickerClass = "input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors w-full";

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
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
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                                <Type size={16} className="mr-2 text-gray-400" /> Event Title *
                            </label>
                            <input
                                {...register('title')}
                                className="input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="e.g. Summer Tech Meetup 2026"
                            />
                            {errors.title?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.title.message)}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                                <AlignLeft size={16} className="mr-2 text-gray-400" /> Description
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors resize-y"
                                placeholder="What is this event about?"
                            />
                        </div>

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
                                            onChange={(date: Date | null) => field.onChange(date)}
                                            selected={field.value as any}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            timeCaption="time"
                                            dateFormat="MMM d, yyyy h:mm aa"
                                            className={datepickerClass}
                                            wrapperClassName="w-full"
                                            minDate={new Date()}
                                            minTime={isSameDay(new Date(), field.value ? new Date(field.value as any) : new Date()) ? new Date() : undefined}
                                            maxTime={isSameDay(new Date(), field.value ? new Date(field.value as any) : new Date()) ? new Date(new Date().setHours(23, 59, 59)) : undefined}
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
                                            onChange={(date: Date | null) => field.onChange(date)}
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
                                                : undefined}
                                            maxTime={startDate && isSameDay(new Date(startDate), field.value ? new Date(field.value as any) : new Date(startDate))
                                                ? new Date(new Date(startDate).setHours(23, 59, 59))
                                                : undefined}
                                        />
                                    )}
                                />
                                {errors.endDate?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.endDate.message)}</p>}
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                                <MapPin size={16} className="mr-2 text-gray-400" /> Location *
                            </label>
                            <input
                                {...register('location')}
                                className="input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="e.g. 123 Main St, City"
                            />
                            {errors.location?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.location.message)}</p>}
                        </div>

                        {/* Capacity */}
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                                <Users size={16} className="mr-2 text-gray-400" /> Capacity (Optional)
                            </label>
                            <Controller
                                control={control}
                                name="capacity"
                                render={({ field }) => (
                                    <input
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
                                        className="input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                                        placeholder={!field.value && field.value !== 0 ? "Set visitor limit or leave for no limit" : ""}
                                    />
                                )}
                            />
                            {errors.capacity?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.capacity.message)}</p>}
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
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                {editId ? 'Save Changes' : 'Publish Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

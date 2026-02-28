import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Calendar as CalendarIcon, MapPin, AlignLeft, Users, Type } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const schema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string().optional(),
    date: yup.date()
        .min(new Date(), 'Cannot create events in the past')
        .required('Date and time are required')
        .typeError('Invalid date/time format'),
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

    const { register, handleSubmit, formState: { errors }, setValue, control } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { visibility: 'PUBLIC', capacity: null }
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(!!editId);
    const navigate = useNavigate();

    useEffect(() => {
        if (editId) {
            api.get(`/events/${editId}`).then(res => {
                const ev = res.data;
                setValue('title', ev.title);
                setValue('description', ev.description || '');
                // format date for datetime-local input
                setValue('date', new Date(ev.date) as any);
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
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5 label-text">
                                <Type size={16} className="mr-2 text-gray-400" /> Event Title *
                            </label>
                            <input
                                {...register('title')}
                                className="input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="e.g. Summer Tech Meetup 2026"
                            />
                            {errors.title?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.title.message)}</p>}
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5 label-text">
                                <AlignLeft size={16} className="mr-2 text-gray-400" /> Description
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors resize-y"
                                placeholder="What is this event about?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5 label-text">
                                    <CalendarIcon size={16} className="mr-2 text-gray-400" /> Date & Time *
                                </label>
                                <Controller
                                    control={control}
                                    name="date"
                                    render={({ field }) => (
                                        <DatePicker
                                            placeholderText="Select date and time"
                                            onChange={(date: Date | null) => field.onChange(date)}
                                            selected={field.value as any}
                                            showTimeSelect
                                            timeFormat="HH:mm"
                                            timeIntervals={15}
                                            timeCaption="time"
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            className="input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors w-full"
                                            wrapperClassName="w-full"
                                        />
                                    )}
                                />
                                {errors.date?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.date.message)}</p>}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5 label-text">
                                    <MapPin size={16} className="mr-2 text-gray-400" /> Location *
                                </label>
                                <input
                                    {...register('location')}
                                    className="input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="e.g. 123 Main St, City"
                                />
                                {errors.location?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.location.message)}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5 label-text">
                                    <Users size={16} className="mr-2 text-gray-400" /> Capacity (Optional)
                                </label>
                                <input
                                    type="number"
                                    {...register('capacity')}
                                    className="input-field py-3 px-4 text-base focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                                    placeholder="Leave empty for unlimited"
                                />
                                {errors.capacity?.message && <p className="text-red-500 text-xs mt-1.5 font-medium">{String(errors.capacity.message)}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Visibility</label>
                                <div className="flex space-x-6 items-center h-12">
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input type="radio" value="PUBLIC" {...register('visibility')} className="w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                        <span className="text-md text-gray-700 group-hover:text-gray-900 transition-colors">Public</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer group">
                                        <input type="radio" value="PRIVATE" {...register('visibility')} className="w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                        <span className="text-md text-gray-700 group-hover:text-gray-900 transition-colors">Private</span>
                                    </label>
                                </div>
                            </div>
                        </div>

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

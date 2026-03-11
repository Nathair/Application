import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, Lock, User as UserIcon, UserPlus } from 'lucide-react';

const schema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup
        .string()
        .required('Password is required')
        .min(6, 'Must be at least 6 characters')
        .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Must contain at least one lowercase letter'),
    name: yup.string().required('Name is required'),
});

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const loginAction = useAuthStore(state => state.login);

    const onSubmit = async (data: any) => {
        try {
            const response = await api.post('/auth/register', data);
            const { user, access_token, refresh_token } = response.data;
            loginAction(user, access_token, refresh_token);
            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center py-20">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 tracking-tight">Create Account</h2>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded-lg text-sm mb-6 flex items-center gap-2">
                        <span className="font-semibold">Error:</span> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Input
                        label="Full Name"
                        icon={<UserIcon size={16} />}
                        placeholder="John Doe"
                        error={errors.name?.message as string}
                        {...register('name')}
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        icon={<Mail size={16} />}
                        placeholder="you@example.com"
                        error={errors.email?.message as string}
                        {...register('email')}
                    />

                    <div className="space-y-1">
                        <Input
                            label="Password"
                            type="password"
                            icon={<Lock size={16} />}
                            placeholder="••••••••"
                            error={errors.password?.message as string}
                            {...register('password')}
                        />
                        <p className="text-[10px] text-gray-400 px-1 italic">Min 6 chars, with upper & lowercase.</p>
                    </div>

                    <Button type="submit" className="w-full mt-4" icon={<UserPlus size={18} />}>
                        Sign Up
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

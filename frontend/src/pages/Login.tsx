import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, Lock, LogIn } from 'lucide-react';

const schema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required'),
});

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const loginAction = useAuthStore(state => state.login);

    const onSubmit = async (data: any) => {
        try {
            const response = await api.post('/auth/login', data);
            const { user, access_token, refresh_token } = response.data;
            loginAction(user, access_token, refresh_token);
            navigate('/');
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="flex justify-center items-center py-20">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 tracking-tight">Welcome Back</h2>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded-lg text-sm mb-6 flex items-center gap-2">
                        <span className="font-semibold">Error:</span> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Input
                        label="Email"
                        type="email"
                        icon={<Mail size={16} />}
                        placeholder="you@example.com"
                        error={errors.email?.message as string}
                        {...register('email')}
                    />

                    <Input
                        label="Password"
                        type="password"
                        icon={<Lock size={16} />}
                        placeholder="••••••••"
                        error={errors.password?.message as string}
                        {...register('password')}
                    />

                    <Button type="submit" className="w-full mt-4" icon={<LogIn size={18} />}>
                        Login
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

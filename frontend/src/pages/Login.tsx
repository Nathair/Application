import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

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
            loginAction(response.data.user, response.data.access_token);
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            {...register('email')}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border outline-none"
                            placeholder="you@example.com"
                        />
                        {errors.email?.message && <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            {...register('password')}
                            type="password"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border outline-none"
                            placeholder="••••••••"
                        />
                        {errors.password?.message && <p className="text-red-500 text-xs mt-1">{String(errors.password.message)}</p>}
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-all mt-4 text-base tracking-wide">
                        Login
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

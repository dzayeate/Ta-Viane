import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import users from '@/mock/users/index.json';
import Swal from 'sweetalert2';
import Navbar from '@/components/navbar';
import { HiKey, HiUser, HiLockClosed, HiSparkles, HiBolt } from 'react-icons/hi2';
import { HiAcademicCap } from 'react-icons/hi';

const Login = () => {
    const { t } = useTranslation('common');
    const [nupkt, setNupkt] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 300));

        const user = users.find(user => user.NUPTK === nupkt && user.Password === password);
        setIsLoading(false);

        if (user) {
            localStorage.setItem('nupkt', nupkt);
            localStorage.setItem('password', password);
            Swal.fire({
                title: t('login.success.title'),
                text: user.pria ? t('login.success.welcomeMale', { name: user.Nama }) : t('login.success.welcomeFemale', { name: user.Nama }),
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#6366f1',
            }).then(() => window.location.reload());
        } else {
            Swal.fire({
                title: t('login.error.title'),
                text: t('login.error.message'),
                icon: 'error',
                confirmButtonText: t('login.error.tryAgain'),
                confirmButtonColor: '#ef4444',
            });
        }
    };

    return (
        <div className='min-h-screen bg-neutral-50 relative overflow-hidden'>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-400/10 rounded-full blur-3xl"></div>
            </div>

            <Navbar />

            {/* Split Layout */}
            <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center pt-20">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-12 py-20">
                    <div className="max-w-md text-center space-y-6 animate-slide-right">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-brand rounded-3xl shadow-2xl mb-4">
                            <HiAcademicCap className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-5xl font-display font-bold text-gradient mb-4">
                            Auto Physics
                        </h1>
                        <p className="text-xl text-neutral-600 font-medium">
                            Platform AI untuk Membuat Soal Fisika dengan Mudah dan Cepat
                        </p>
                        <div className="flex items-center justify-center gap-8 pt-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-brand-600">AI</div>
                                <div className="text-sm text-neutral-500">Powered</div>
                            </div>
                            <div className="w-px h-12 bg-neutral-300"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-brand-600">100+</div>
                                <div className="text-sm text-neutral-500">Soal/Batch</div>
                            </div>
                            <div className="w-px h-12 bg-neutral-300"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-brand-600">24/7</div>
                                <div className="text-sm text-neutral-500">Available</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 lg:px-12">
                    <div className="w-full max-w-md animate-slide-left">
                        <div className="card shadow-large border-0">
                            {/* Header */}
                            <div className="px-8 pt-8 pb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 bg-gradient-brand rounded-xl shadow-md">
                                        <HiKey className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-neutral-900">
                                            {t('login.title')}
                                        </h2>
                                        <p className="text-sm text-neutral-500">
                                            Masuk ke akun Anda
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleLogin} className="px-8 pb-8 space-y-5">
                                {/* NUPTK Input */}
                                <div>
                                    <label htmlFor="nuptk" className="block mb-2 text-sm font-semibold text-neutral-700">
                                        {t('login.nuptk')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                                            <HiUser className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="nuptk"
                                            id="nuptk"
                                            value={nupkt}
                                            onChange={(e) => setNupkt(e.target.value)}
                                            className="input pl-12"
                                            placeholder={t('login.nuptkPlaceholder')}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div>
                                    <label htmlFor="password" className="block mb-2 text-sm font-semibold text-neutral-700">
                                        {t('login.password')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                                            <HiLockClosed className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            name="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={t('login.passwordPlaceholder')}
                                            className="input pl-12"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn btn-primary w-full btn-lg gap-2 group mt-6"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{t('login.loginButton')}</span>
                                            <HiSparkles className="text-lg transition-transform duration-200 group-hover:rotate-12" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer Note */}
                            <div className="px-8 pb-8 pt-4 border-t border-neutral-200">
                                <p className="text-xs text-center text-neutral-500">
                                    Platform ini menggunakan teknologi AI untuk membantu guru membuat soal fisika dengan mudah.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
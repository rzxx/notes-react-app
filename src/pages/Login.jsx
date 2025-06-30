import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../components/Button';
import InputField from '../components/InputField';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', username);
                navigate('/dashboard', { replace: true });
            } else if (data.error) {
                setError(data.error);
            } else {
                setError('Ошибка авторизации');
            }
        } catch (err) {
            setError('Ошибка сети: ' + err.message);
        }
    };

    return (
        <div className="w-full h-[90dvh] flex flex-col justify-center items-center">
            <h2 className="text-2xl font-semibold text-stone-700/85 mb-8">Вход в Grainy Notes</h2>
            <div className="block my-2">
                <label className="text-stone-700/85">Логин
                    <InputField type="text" value={username} onChange={e => setUsername(e.target.value)} required={true} placeholder="Введите ваш логин" />
                </label>
            </div>
            <div className="block mt-2 mb-8">
                <label className="text-stone-700/85">Пароль
                    <InputField type="password" value={password} onChange={e => setPassword(e.target.value)} required={true} placeholder="Введите ваш пароль" />
                </label>
            </div>
            <Button onClick={handleSubmit} color="green" text="Войти" />
            {error && <p className="text-rose-700 mt-4">{error}</p>}
        </div>
    );
};

export default Login;
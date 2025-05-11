import React, { useState } from 'react';
import Button from '../components/Button';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        try {
            const res = await fetch('http://127.0.0.1:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (data.message === 'User created') {
                setSuccess('Регистрация успешна!');
            } else if (data.error) {
                setError(data.error);
            } else {
                setError('Ошибка регистрации');
            }
        } catch (err) {
            setError('Ошибка сети: ' + err.message);
        }
    };

    return (
        <div className="w-full h-[90dvh] flex flex-col justify-center items-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Войти в СУПЕР ДУПЕР ЗАМЕТКИ</h2>
            <div className="block">
                <p>Логин</p>
                <input type="text" className="border border-gray-300 rounded-xl px-4 py-2 mt-2 mb-4" placeholder="Введите ваш логин"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required />
            </div>
            <div className="block">
                <p>Пароль</p>
                <input type="password" className="border border-gray-300 rounded-xl px-4 py-2 mt-2 mb-4" placeholder="Введите ваш пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required />
            </div>
            <div className="block">
                <p>Повторите пароль</p>
                <input type="password" className="border border-gray-300 rounded-xl px-4 py-2 mt-2 mb-4" placeholder="Введите ваш пароль"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required />
            </div>
            <Button onClick={handleSubmit} color="green" text="Зарегистрироваться" />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
        </div>
    );
};

export default Register;
import React, { useState } from 'react';
import Button from '../components/Button';
import InputField from '../components/InputField';

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
            <h2 className="text-2xl font-semibold text-stone-700/85 mb-8">Регистрация в Grainy Notes</h2>
            <div className="my-2">
                <label className="text-stone-700/85">Логин
                    <InputField type="text" value={username} onChange={e => setUsername(e.target.value)} required={true} placeholder="Введите ваш логин" />
                </label>

            </div>
            <div className="block my-2">
                <label className="text-stone-700/85">Пароль
                    <InputField type="password" value={password} onChange={e => setPassword(e.target.value)} required={true} placeholder="Введите ваш пароль" />
                </label>
            </div>
            <div className="block mt-2 mb-8">
                <label className="text-stone-700/85">Повторите пароль
                    <InputField type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={true} placeholder="Введите ваш пароль" />
                </label>
            </div>
            <Button onClick={handleSubmit} color="green" text="Зарегистрироваться" />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
        </div>
    );
};

export default Register;
import React from 'react';
import { Link } from 'react-router';

const Navbar = () => {
    return (
        <div className="w-full flex justify-between items-center py-4">
            <Link to="/" className="text-2xl text-gray-900 font-semibold">СУПЕР ДУПЕР ЗАМЕТКИ</Link>

            <div className="flex gap-4 text-gray-800 font-light">
                <Link to="/login">Войти</Link>
                <Link to="/register">Создать аккаунт</Link>
            </div>
        </div>
    );
};

export default Navbar;
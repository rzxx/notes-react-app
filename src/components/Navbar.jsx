import React from 'react';
import { Link } from 'react-router';
import ButtonLink from './ButtonLink';

const Navbar = () => {

    return (
        <div className="max-w-7xl flex justify-between items-center mx-auto pt-4 pb-1">
            <Link to="/" className="text-xl font-black text-transparent bg-linear-to-tr from-yellow-900 to-rose-900 bg-clip-text">Grainy Notes</Link>

            <div className="flex items-baseline gap-4 text-stone-700">
                <Link to="/login">Войти</Link>
                <ButtonLink to="/register" text="Создать аккаунт"/>
            </div>
        </div>
    );
};

export default Navbar;
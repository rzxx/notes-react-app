import React from "react";

const Login = () => {
    return (
        <div className="w-full h-[90dvh] flex flex-col justify-center items-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Войти в СУПЕР ДУПЕР ЗАМЕТКИ</h2>
            <div className="block">
                <p>Логин</p>
                <input type="text" className="border border-gray-300 rounded-xl px-4 py-2 mt-2 mb-4" placeholder="Введите ваш логин" />
            </div>
            <div className="block">
                <p>Пароль</p>
                <input type="password" className="border border-gray-300 rounded-xl px-4 py-2 mt-2 mb-4" placeholder="Введите ваш пароль" />
            </div>
            <button className="bg-green-500 hover:bg-green-600 transition duration-75 text-white rounded-xl px-4 py-2 mt-4">Войти</button>
        </div>
    );
}

export default Login;
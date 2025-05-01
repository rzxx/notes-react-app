import React from "react";

const Register = () => {
    return (
        <div className="w-full flex flex-col justify-center items-center h-dvh">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Зарегистрироваться в СУПЕР ДУПЕР ЗАМЕТКАХ</h2>
            <div className="block">
                <p>Логин</p>
                <input type="text" className="border border-gray-300 rounded-xl px-4 py-2 mt-2 mb-4" placeholder="Введите ваш логин" />
            </div>
            <div className="block">
                <p>Электронная почта</p>
                <input type="email" className="border border-gray-300 rounded-xl px-4 py-2 mt-2 mb-4" placeholder="Введите вашу электронную почту" />
            </div>
            <div className="block">
                <p>Пароль</p>
                <input type="password" className="border border-gray-300 rounded-xl px-4 py-2 mt-2 mb-4" placeholder="Введите ваш пароль" />
            </div>
            <button className="bg-green-500 hover:bg-green-600 transition duration-75 text-white rounded-xl px-4 py-2 mt-4">Зарегистрироваться</button>
        </div>
    );
}

export default Register;
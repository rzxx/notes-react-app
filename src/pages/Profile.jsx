import { React, useState } from "react";
import { useNavigate } from "react-router";
import GradientBackground from "../components/GradientBackground";
import Navbar from "../components/Navbar"
import Button from "../components/Button"
import ButtonLink from "../components/ButtonLink";

const Profile = () => {
    const navigate = useNavigate();
    const [username] = useState(() => localStorage.getItem('username') || 'Пользователь');
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate("/");
    };

    return (<>
        <GradientBackground />
        <Navbar />
        <div className="w-full h-[80dvh] flex flex-col justify-center items-center">
            <h1 className="text-4xl text-stone-700 font-semibold mb-4 my-8">Добро пожаловать, {username}</h1>
            <p className="text-xl font semibold text-stone-700 mb-8">Вход в аккаунт выполнен.</p>
            <div className="flex gap-4">
                <Button onClick={handleLogout} text="Выйти из аккаунта" />
                <ButtonLink color="green" to="/dashboard" text="Вернуться к заметкам" />
            </div>
        </div>
    </>);
}

export default Profile;
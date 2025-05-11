import React from "react";
import { Link, useParams, useNavigate } from "react-router";
import GradientBackground from "../components/GradientBackground";
import ItemsList from "../components/ItemsList";
import Button from "../components/Button";

const Dashboard = () => {
    const params = useParams();
    const notePath = params['*'];
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate("/");
    };

    return (
        <>
            <GradientBackground />

            <div className="w-dvw px-14 grid grid-cols-3 py-4">
                <Link to="/" className="text-lg font-black text-stone-700/85">Grainy Notes</Link>

                <div className="flex flex-col justify-center items-center">
                    <h4 className="text-xl font-black text-transparent bg-linear-to-tr from-yellow-900/85 to-rose-900/85 bg-clip-text">{notePath ? "Здесь будет название заметки" : "Привет!"}</h4>
                    <p className="text-sm text-stone-700/85">/{notePath}</p>
                </div>
            </div>

            <div className="w-dvw relative"
                style={{ height: "calc(100vh - 5rem)" }}>
                <div className="absolute px-14 h-full left-0 top-0 flex flex-col">
                    <div className="flex-1 min-w-42 flex items-center-safe overflow-y-auto max-h-full no-scrollbar">
                        <ItemsList />
                    </div>

                    <div className="mb-6">
                        <p className="text-stone-500/85 text-sm mb-1">Пользователь</p>
                        <Link to="/profile" className="mr-2">
                            <span className="material-symbols-outlined text-stone-700/85 hover:text-stone-700 transition-colors duration-150">
                                account_circle
                            </span>
                        </Link>
                        <button onClick={handleLogout} className="cursor-pointer">
                            <span className="material-symbols-outlined text-stone-700/85 hover:text-stone-700 transition-colors duration-150">
                                logout
                            </span>
                        </button>
                    </div>
                </div>
                <div className="max-w-5xl mx-auto h-full bg-stone-50/85 rounded-t-4xl shadow-box overflow-clip">
                    <div className="mx-auto w-full px-8 pt-4 pb-8 flex flex-row-reverse">
                        {/* top bar */}
                        <button className="cursor-pointer">
                            <span className="material-symbols-outlined text-stone-700/85 hover:text-stone-700 transition-colors duration-150">
                                menu
                            </span>
                        </button>
                    </div>
                    <div className="mx-auto w-full px-36 text-stone-700">
                        {/* text editor */}
                        {notePath
                            ? <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
                            : <p>Добро пожаловать в Grainy Notes! В панели слева отображаются все заметки, которые есть у тебя в профиле. Нажми на них, чтобы открыть их.</p>
                        }
                    </div>
                </div>
            </div >
        </>
    );
}

export default Dashboard;
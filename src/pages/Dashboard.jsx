import React from "react";
import { Link } from "react-router";
import GradientBackground from "../components/GradientBackground";
import ItemsList from "../components/ItemsList";

const Dashboard = () => {
    return (
        <>
            <GradientBackground/>

            <div className="max-w-7xl grid grid-cols-3 mx-auto py-4">
                <Link to="/" className="text-lg font-black text-stone-700/85">Grainy Notes</Link>

                <div className="flex flex-col justify-center items-center">
                    <h4 className="text-xl font-black text-transparent bg-linear-to-tr from-yellow-900/85 to-rose-900/85 bg-clip-text">Новая заметка</h4>
                    <p className="text-sm text-stone-700/85">/home/newpage</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto relative"
                style={{ height: "calc(100vh - 5rem)" }}>
                <div className="absolute h-full left-0 top-0 flex flex-col">
                    <div className="flex-1 w-42 flex items-center-safe overflow-y-auto max-h-full no-scrollbar">
                        <ItemsList />
                    </div>
                    
                    <div className="mb-6">
                        <p className="text-stone-500/85 text-sm">Пользователь</p>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto h-full bg-stone-50/85 rounded-t-4xl shadow-box overflow-clip">
                    <div className="mx-auto w-full px-8 pt-4 pb-8 flex flex-row-reverse">
                        {/* top bar */}
                        <p>menu</p>
                    </div>
                    <div className="mx-auto w-full px-24 text-stone-700">
                        {/* text editor */}
                        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;
import React from "react";

const Home = () => {
    return (
        <div className="max-w-5xl mx-auto h-[90dvh] flex flex-col justify-center items-start">
            <h1 className="text-7xl font-black mb-4 text-balance text-shadow-inset
            text-transparent bg-linear-to-tr from-yellow-900/90 to-rose-900/90 bg-clip-text pb-4">Заметки, к которым ты уже привык</h1>
            <p className="text-stone-700/90 text-xl font-semibold">Но со свагой</p>
        </div>
    );
}

export default Home;
import React from 'react';
import { Link } from 'react-router';

const ButtonLink = ({ to, text = "кнопка", color = "rose" }) => {
    const colorClasses = {
        rose: "hover:bg-rose-400",
        blue: "hover:bg-blue-400",
        green: "hover:bg-emerald-400",
    };

    return (
        <Link className={`relative bg-linear-to-t from-black/10 to-white/10 bg-stone-50
        transition duration-75 ${colorClasses[color] || "hover:bg-rose-400"} text-stone-700 hover:text-stone-50 active:text-stone-200 active:scale-95
        shadow-button active:shadow-pressedbutton px-4 py-2 rounded-lg overflow-hidden text-center`}
            to={to}>
            <span
                className="pointer-events-none absolute inset-0 z-0 bg-blend-overlay opacity-15"
                aria-hidden="true"
            >
                <svg
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </span>
            <span className="z-[1]">{text}</span>
        </Link>
    )
};

export default ButtonLink;
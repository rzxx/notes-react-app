import React from 'react';
import { Link } from 'react-router';

export default function ButtonLink({to, text}) {
    return (
        <Link className="relative bg-linear-to-t from-black/5 to-white/5 bg-stone-50
        transition duration-75 hover:bg-rose-400 text-stone-700 hover:text-stone-50 active:text-stone-200 active:scale-95
        shadow-button active:shadow-pressedbutton px-4 py-2 rounded-lg overflow-hidden"
        to={to}>
            <span
                className="pointer-events-none absolute inset-0 z-0 bg-blend-overlay opacity-30"
                aria-hidden="true"
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 200"
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

import React from 'react';

const GradientBackground = () => {
    return (<>
        <div className="fixed w-full h-full -z-100">
            <span
                className="pointer-events-none inset-0"
                aria-hidden="true"
            >
                <svg
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="gradient" x1="1" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7e22ce" />
                            <stop offset="50%" stopColor="#ffcc2d" />
                            <stop offset="100%" stopColor="#7e22ce" />
                        </linearGradient>
                    </defs>
                    <rect className="w-full h-full saturate-150" fill="url(#gradient)" />
                    <rect className="w-full h-full fill-stone-50/69" />
                    <rect className="w-full h-full opacity-30" filter="url(#noiseFilter)" />
                </svg>
            </span>
        </div>
    </>)
};

export default GradientBackground;
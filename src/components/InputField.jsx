import React from 'react';

const InputField = ({ value, type, onChange, required, placeholder }) => {
    return (
        <span className="relative block">
            <input
                type={type}
                className="bg-stone-100 py-2 px-2 rounded-lg shadow-input text-stone-700 placeholder:text-stone-500
                outline-0 focus:shadow-inputfocus focus:bg-stone-50 hover:bg-stone-50
                transition duration-75 ease-out"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
            <span
                className="pointer-events-none absolute inset-0 z-0 bg-blend-overlay opacity-10"
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
        </span>
    );
}

export default InputField;
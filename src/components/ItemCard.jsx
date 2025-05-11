import React from "react";

const ItemCard = ({ title, path, selected }) => {
    return (
    <div className={`${selected ? 'my-3 pl-1' : 'my-1'}
        transition-all duration-150 ease-out hover:ml-0.5`}>
        <p className={`${selected ? 'text-stone-700 text-lg font-semibold' : 'text-stone-700/85 hover:text-stone/700'}
        transition-all duration-150 ease-out`}>
            {title}
        </p>
        <p className={`${selected ? 'text-stone-500 -mt-1' : 'text-stone-500/85 hover:text-stone-500 text-sm -mt-0.5'}
        transition-all duration-150 ease-out`}>
            {path}
        </p>
    </div>
    );
}

export default ItemCard;
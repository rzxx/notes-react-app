import React from "react";

const ItemCard = React.memo(({ title, path, selected }) => {
    return (
        <div className={`${selected ? 'py-1 pl-1' : 'opacity-85 hover:opacity-100'}
        transition-all duration-150 ease-out hover:ml-0.5`}>
            <p className={`${selected && ' text-lg font-semibold'}
        text-stone-700 transition-all duration-150 ease-out`}>
                {title}
            </p>
            <p className={`${selected ? '-mt-1' : 'text-sm -mt-0.5'}
        text-stone-500 transition-all duration-150 ease-out`}>
                {path}
            </p>
        </div>
    );
});

export default ItemCard;
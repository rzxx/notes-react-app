import React from "react";

const ItemCard = ({ title, path, selected }) => {
    return (<>
    {selected
        ? <div className="my-3 pl-1">
            <p className="text-stone-700 text-lg font-semibold">{title}</p>
            <p className="text-stone-500 -mt-1">{path}</p>
        </div>
        : <div className="my-1">
            <p className="text-stone-700/85">{title}</p>
            <p className="text-stone-500/85 text-sm -mt-0.5">{path}</p>
        </div>
    }
    </>
    );
}

export default ItemCard;
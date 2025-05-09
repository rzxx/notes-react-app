import React, { useState } from "react";
import ItemCard from "./ItemCard";

const ItemsList = () => {
    const [items,] = useState([
        {
            title: "title",
            path: "/home",
            selected: false,
        },
        {
            title: "title",
            path: "/home",
            selected: true,
        },
        {
            title: "title",
            path: "/home",
            selected: false,
        },
        {
            title: "title",
            path: "/home",
            selected: false,
        },
    ])

    return (
        <div className="flex flex-col">
            {items.map((item) => (
                <ItemCard key={item.title+item.path} title={item.title} path={item.path} selected={item.selected} />
            ))}
        </div>
    );
}

export default ItemsList;
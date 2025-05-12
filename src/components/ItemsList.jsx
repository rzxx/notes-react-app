import React from "react";
import { Link } from "react-router";
import ItemCard from "./ItemCard";

const ItemsList = ({ currentPath, items, createNote }) => {
    return (
        <div className="flex flex-col gap-2">
            <button className="flex items-center text-stone-500/85 hover:text-stone-600 hover:ml-1
            transition-all duration-150 ease-out cursor-pointer py-2" onClick={createNote}>
                <span className="material-symbols-outlined ">
                    add
                </span>
                <p className="text-lg font-semibold">
                    Создать заметку
                </p>
            </button>
            {items.map((item) => (
                <Link to={`/dashboard${item.path}`} key={item._id || item.path}>
                    <ItemCard title={item.title} path={item.path} selected={`/${currentPath}` === item.path} />
                </Link>
            ))}
        </div>
    );
}

export default ItemsList;
import React, { useState } from "react";
import { Link, useParams } from "react-router";
import ItemCard from "./ItemCard";

const ItemsList = () => {
    const params = useParams();
    const currentPath = params['*'];
    const [items,] = useState([
        {
            title: "Домашняя заметка",
            path: "/home",
        },
        {
            title: "Идеи",
            path: "/ideas",
        },
        {
            title: "Работа",
            path: "/work",
        },
        {
            title: "Архив",
            path: "/archive",
        },
    ])

    return (
        <div className="flex flex-col">
            {items.map((item) => (
                <Link to={`/dashboard${item.path}`} key={item.title + item.path}>
                    <ItemCard title={item.title} path={item.path} selected={`/${currentPath}` === item.path} />
                </Link>
            ))}
        </div>
    );
}

export default ItemsList;
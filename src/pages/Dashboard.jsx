import React from "react";

const Dashboard = () => {
    const user = "усёр";

    return (
        <div className="w-full flex flex-col justify-center items-center">
            <h1 className="text-4xl text-gray-900 font-semibold mb-4 my-8">Добро пожаловать, {user}!</h1>
        </div>
    );
}

export default Dashboard;
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const PrivateRoute = ({ children }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login', { replace: true });
        }
    }, [token, navigate]);

    return token ? children : null;
};

export default PrivateRoute;
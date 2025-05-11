import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";
import Landing from './pages/Landing.jsx';
import App from './App.jsx'
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import PrivateRoute from './pages/PrivateRoute.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path='/dashboard/*' element={<PrivateRoute> <Dashboard /> </PrivateRoute>}>
        </Route>
        <Route path="/profile" element={<PrivateRoute> <Profile /> </PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)

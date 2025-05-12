import React, { useEffect, useState } from 'react';
import './Login.css'; // Import the CSS file
import Navbar from '../components/Navbar';
import Sidebar from '../components/SideBar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const loginData = {
            username: username,
            password: password
        };
    
        try {
            const response = await axios.post('https://naom0qtxma.execute-api.us-east-1.amazonaws.com/api/login', loginData,{
                withCredentials: true,
            });
            console.log('Login successful:', response.data);
            if (response.data.message === 'OK') {
                // Handle successful login, e.g., redirect to dashboard
                navigate('/home')
            }
            // Handle successful login
        } catch (error) {
            console.error('Login failed:', error);
            // Handle login failure
        }finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                const response = await axios.get('https://naom0qtxma.execute-api.us-east-1.amazonaws.com/api/check-auth', {
                    withCredentials: true,
                });
                if (response.status === 200) {
                    navigate('/home');
                }
            } catch (error) {
                
            }finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <h2>Loading....</h2>
            </div>
        );
    }

    return (
        <div>
            <Navbar isLoggedIn={false} />
            <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Login</h2>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="submit-button-login">
                    {submitting ? 'Logging...' : 'Login'}
                </button>
            </form>
        </div>
        </div>
    );
};

export default Login;
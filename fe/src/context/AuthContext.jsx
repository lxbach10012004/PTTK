import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi parse user từ localStorage:", error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, expectedRole) => {
    console.log(`Attempting login for: ${email} as ${expectedRole} (direct password check)`);
    setLoading(true);
    try {
      const response = await fetch('https://mmncb6j3-5000.asse.devtunnels.ms/api/auth/login', { // Sử dụng IP và Port của backend Flask
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Gửi cả email và password
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.user.vai_tro === expectedRole) {
        const loggedInUser = data.user;
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        console.log("Login successful (direct check):", loggedInUser);
        setLoading(false);
        return true;
      } else {
        console.log("Login failed:", data.error || "Vai trò không khớp");
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Lỗi gọi API đăng nhập:", error);
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    console.log("Logout successful.");
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Đảm bảo bạn đã tạo AuthContext

function ResidentLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Lấy hàm login từ context

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Reset lỗi

    try {
      // Gọi hàm login từ AuthContext (hàm này sẽ gọi API và cập nhật state)
      // Giả sử hàm login trả về true nếu thành công, false nếu thất bại
      // và nhận vai trò 'CuDan' để kiểm tra đúng loại tài khoản
      const success = await login(email, password, 'CuDan');

      if (success) {
        navigate('/resident'); // Chuyển hướng đến dashboard cư dân nếu thành công
      } else {
        setError('Email hoặc mật khẩu không đúng hoặc bạn không phải Cư dân.');
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError('Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập Cư dân</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="nhapemail@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="********"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Đăng nhập
            </button>
          </div>
          <div className="text-center mt-4">
            <Link to="/" className="text-sm text-blue-600 hover:underline">
              Quay lại trang chọn vai trò
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResidentLogin;
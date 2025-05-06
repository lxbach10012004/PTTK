import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function ResidentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      // Gọi hàm login từ AuthContext với vai trò 'CuDan'
      const success = await login(email, password, "CuDan");

      if (success) {
        navigate("/resident");
      } else {
        setError(
          "Email hoặc mật khẩu không đúng hoặc bạn không phải Cư dân."
        );
      }
    } catch (err) {
      console.error("Lỗi đăng nhập cư dân:", err);
      setError("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Phần Mềm Quản Lý Chung Cư"
          src="/src/assets/uet_logo.png"
          className="mx-auto h-30 w-auto"
        />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Đăng nhập Cư dân
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
                placeholder="resident@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Mật khẩu
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
                placeholder="********"
              />
            </div>
          </div>

          {error && (
            <div className="mt-2">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Không phải cư dân?{" "}
          <Link
            to="/"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Quay lại trang chọn vai trò
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResidentLogin;

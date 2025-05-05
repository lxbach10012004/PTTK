import bcrypt

def hash_password(plain_password):
    """Hash mật khẩu."""
    password_bytes = plain_password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode('utf-8') # Lưu dạng string vào DB

def check_password(plain_password, hashed_password):
    """Kiểm tra mật khẩu có khớp với hash không."""
    plain_password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)

# --- Dùng để tạo hash ban đầu cho user mẫu ---
if __name__ == '__main__':
    # Thay 'admin' bằng mật khẩu bạn muốn hash
    plain = 'admin'
    hashed = hash_password(plain)
    print(f"Mật khẩu '{plain}' sau khi hash: {hashed}")
    # Chạy file này bằng: python utils/password_utils.py
    # Copy chuỗi hash này để cập nhật vào database cho user mẫu
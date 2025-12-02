import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  const from = location.state?.from || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      await Swal.fire({
        icon: 'success',
        title: '로그인 완료',
        text: '다시 만나서 반가워요!',
        confirmButtonColor: '#667eea',
      });
      navigate(from, { replace: true });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: err.message || '로그인에 실패했습니다. 다시 시도해주세요.',
        confirmButtonColor: '#667eea',
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">AdvanceKeep</h1>
        <p className="auth-subtitle">내 노트를 안전하게 관리하세요</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="auth-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label className="auth-label" htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="auth-input"
            placeholder="비밀번호를 입력하세요"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="auth-footer">
          <span>계정이 없으신가요?</span>
          <Link to="/register" className="auth-link">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

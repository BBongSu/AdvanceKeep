import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      await Swal.fire({
        icon: 'warning',
        title: '비밀번호 확인',
        text: '비밀번호가 일치하지 않습니다.',
        confirmButtonColor: '#667eea',
      });
      return;
    }

    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      await Swal.fire({
        icon: 'success',
        title: '회원가입 완료',
        text: '로그인이 완료되었습니다.',
        confirmButtonColor: '#667eea',
      });
      navigate('/', { replace: true });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: '회원가입 실패',
        text: err.message || '회원가입에 실패했습니다. 다시 시도해주세요.',
        confirmButtonColor: '#667eea',
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">환영합니다</h1>
        <p className="auth-subtitle">AdvanceKeep을 시작해보세요</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="name">
            이름
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="auth-input"
            placeholder="이름을 입력하세요"
            value={form.name}
            onChange={handleChange}
            required
          />

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
            placeholder="6자 이상 입력하세요"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          <label className="auth-label" htmlFor="confirm">
            비밀번호 확인
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            className="auth-input"
            placeholder="비밀번호를 다시 입력하세요"
            value={form.confirm}
            onChange={handleChange}
            required
          />

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="auth-footer">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login" className="auth-link">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

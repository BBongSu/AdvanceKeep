import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { findEmailByName } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  // 이미 로그인된 사용자는 접근 불가 -> 홈으로 리다이렉트
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  const from = location.state?.from || '/';

  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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

  const handleFindEmail = async () => {
    const { value: name } = await Swal.fire({
      title: '아이디(이메일) 찾기',
      input: 'text',
      inputLabel: '가입할 때 사용한 이름을 입력해주세요.',
      inputPlaceholder: '홍길동',
      showCancelButton: true,
      confirmButtonText: '찾기',
      cancelButtonText: '취소',
      confirmButtonColor: '#667eea',
    });

    if (name) {
      try {
        const emails = await findEmailByName(name);
        if (emails.length > 0) {
          const emailList = emails.map(e => `<li>${e.replace(/(?<=.{2}).(?=.*@)/g, '*')}</li>`).join('');
          await Swal.fire({
            icon: 'info',
            title: '찾은 이메일 목록',
            html: `<ul>${emailList}</ul><p style="font-size:0.8em; color:gray; margin-top:10px;">*개인정보 보호를 위해 일부 가려집니다.</p>`,
            confirmButtonColor: '#667eea',
          });
        } else {
          await Swal.fire({
            icon: 'warning',
            text: '해당 이름으로 가입된 이메일을 찾을 수 없습니다.',
            confirmButtonColor: '#667eea',
          });
        }
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          text: '검색 중 오류가 발생했습니다.',
          confirmButtonColor: '#667eea',
        });
      }
    }
  };

  const handleFindPassword = async () => {
    const { value: email } = await Swal.fire({
      title: '비밀번호 재설정',
      input: 'email',
      inputLabel: '가입한 이메일 주소를 입력해주세요.',
      inputPlaceholder: 'user@example.com',
      showCancelButton: true,
      confirmButtonText: '메일 보내기',
      cancelButtonText: '취소',
      confirmButtonColor: '#667eea',
    });

    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        await Swal.fire({
          icon: 'success',
          title: '이메일 발송 완료',
          text: '비밀번호 재설정 링크가 이메일로 전송되었습니다. 메일함을 확인해주세요.',
          confirmButtonColor: '#667eea',
        });
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: '전송 실패',
          text: '해당 이메일을 찾을 수 없거나 오류가 발생했습니다.',
          confirmButtonColor: '#667eea',
        });
      }
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

        <div className="auth-footer" style={{ flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>계정이 없으신가요?</span>
            <Link to="/register" className="auth-link">
              회원가입
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleFindEmail}
              style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
            >
              아이디 찾기
            </button>
            <span style={{ color: '#ccc' }}>|</span>
            <button
              type="button"
              onClick={handleFindPassword}
              style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { findEmailByName } from '../services/auth';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  // 이미 로그인된 사용자는 접근 불가 -> 홈으로 리다이렉트
  const { login, loading, user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  const [stayLoggedIn, setStayLoggedIn] = useState(false);

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
      await login(form.email, form.password, stayLoggedIn);
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

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(stayLoggedIn);
      await Swal.fire({
        icon: 'success',
        title: '로그인 완료',
        text: '구글 계정으로 로그인되었습니다!',
        confirmButtonColor: '#667eea',
      });
      navigate(from, { replace: true });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: err.message || '구글 로그인에 실패했습니다.',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <input
              id="stayLoggedIn"
              type="checkbox"
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="stayLoggedIn" style={{ fontSize: '14px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              로그인 상태 유지
            </label>
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 소셜 로그인 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>또는</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              background: 'white',
              color: '#333',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.borderColor = '#667eea';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
            </svg>
            Google로 로그인
          </button>
        </div>

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

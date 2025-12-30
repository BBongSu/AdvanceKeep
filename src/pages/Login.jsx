import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
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
        confirmButtonColor: '#10b981',
      });
      navigate(from, { replace: true });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: err.message || '로그인에 실패했습니다. 다시 시도해주세요.',
        confirmButtonColor: '#10b981',
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
      confirmButtonColor: '#10b981',
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
            confirmButtonColor: '#10b981',
          });
        } else {
          await Swal.fire({
            icon: 'warning',
            text: '해당 이름으로 가입된 이메일을 찾을 수 없습니다.',
            confirmButtonColor: '#10b981',
          });
        }
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          text: '검색 중 오류가 발생했습니다.',
          confirmButtonColor: '#10b981',
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
      confirmButtonColor: '#10b981',
    });

    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        await Swal.fire({
          icon: 'success',
          title: '이메일 발송 완료',
          text: '비밀번호 재설정 링크가 이메일로 전송되었습니다. 메일함을 확인해주세요.',
          confirmButtonColor: '#10b981',
        });
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: '전송 실패',
          text: '해당 이메일을 찾을 수 없거나 오류가 발생했습니다.',
          confirmButtonColor: '#10b981',
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
        confirmButtonColor: '#10b981',
      });
      navigate(from, { replace: true });
    } catch (err) {
      await Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: err.message || '구글 로그인에 실패했습니다.',
        confirmButtonColor: '#10b981',
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
              e.currentTarget.style.borderColor = '#10b981';
            }}

            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <FcGoogle size={18} />
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
            >
              아이디 찾기
            </button>
            <span style={{ color: '#ccc' }}>|</span>
            <button
              type="button"
              onClick={handleFindPassword}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default Login;

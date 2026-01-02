import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

export const useBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = async () => {
      // 1. SweetAlert2 팝업이 열려있는지 확인
      const swalContainer = document.querySelector('.swal2-container');
      if (swalContainer && !swalContainer.classList.contains('swal2-hidden')) {
        // ESC 키 이벤트를 발생시켜 닫기 시도
        const escapeEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          charCode: 27,
          bubbles: true,
          cancelable: true,
          view: window
        });
        document.dispatchEvent(escapeEvent);
        return;
      }

      // 2. 모달 오버레이가 열려있는지 확인 (EditNoteModal 등)
      // DOM에서 가장 위에 있는(마지막) 오버레이를 찾습니다.
      const overlays = document.querySelectorAll('.modal-overlay');
      if (overlays.length > 0) {
        const lastOverlay = overlays[overlays.length - 1];
        // EditNoteModal 등은 mousedown과 click 타겟이 일치해야 닫히므로 두 이벤트 모두 발생
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });

        lastOverlay.dispatchEvent(mouseDownEvent);
        lastOverlay.dispatchEvent(clickEvent);
        return;
      }

      // 3. 사이드바 오버레이가 열려있는지 확인
      const sidebarOverlay = document.querySelector('.sidebar-overlay');
      if (sidebarOverlay) {
        sidebarOverlay.click();
        return;
      }

      // 4. 모달/팝업이 없다면 네비게이션 처리
      // 루트 경로 목록 정의
      const rootPaths = ['/', '/login', '/register', '/todo', '/archive', '/trash'];

      // 현재 경로가 루트 경로 중 하나이거나, 라벨 경로의 루트인 경우 (/label/xyz)
      // 라벨 경로는 /label/로 시작하는지 체크
      const isRootPath = rootPaths.includes(location.pathname) || location.pathname.startsWith('/label/');

      if (isRootPath) {
        // 루트 경로에서는 앱 종료
        App.exitApp();
      } else {
        // 그 외 경로에서는 뒤로 가기
        navigate(-1);
      }
    };

    // 리스너 등록
    const backButtonListener = App.addListener('backButton', handleBackButton);

    // 리스너 제거 (Cleanup)
    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [navigate, location]);
};

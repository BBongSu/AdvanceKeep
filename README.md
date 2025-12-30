# AdvanceKeep

AdvanceKeep은 Google Keep의 기능을 참고하고 부족한 부분이 무엇이 있을지 고민하며 사용자 경험을 개선하기 위해 개발중인 웹 기반 메모 애플리케이션입니다. 직관적인 인터페이스를 통해 메모를 손쉽게 작성, 관리, 검색할 수 있습니다.

---

## 🚀 설치 및 실행 방법

이 프로젝트는 React 프론트엔드와 FireBase(NoSQL)로 구성되어 있습니다. `npm start` 명령어 하나로 간편하게 실행할 수 있습니다.

### 1. 프로젝트 클론 및 의존성 설치
```bash
npm install
```

### 2. 프로젝트 실행
프론트엔드 서버를 실행합니다.
```bash
npm start
```

브라우저에서 실행된 주소(보통 `http://localhost:5173`)로 접속하여 애플리케이션을 확인하세요.

> **참고**: Firebase를 사용하므로 별도의 백엔드 서버 실행이 필요하지 않습니다.

---

## ✨ 주요 기능

*   **실시간 협업 (Real-time Sync)**: Firebase Firestore의 `onSnapshot`을 통해 내가 수정한 내용이나 친구가 공유해준 메모가 새로고침 없이 즉시 화면에 나타납니다.
*   **메모 관리**: 제목과 내용으로 구성된 메모를 자유롭게 작성, 수정, 삭제할 수 있습니다.
*   **체크리스트 지원**: 할 일 목록이나 장보기 목록 등을 위한 체크리스트 형태의 메모를 작성하고 완료 항목을 관리할 수 있습니다.
*   **메모 고정**: 중요한 메모를 상단에 고정하여 빠르게 접근할 수 있습니다.
*   **이미지 첨부 및 확대**: 메모에 이미지를 첨부하고(Firebase Storage), 클릭 시 전체 화면으로 확대(Lightbox)하여 볼 수 있습니다.
*   **리스트 뷰 / 그리드 뷰**: 사용자의 선호에 따라 메모 목록을 리스트 형태 또는 그리드 형태로 전환하여 볼 수 있습니다.
*   **마크다운 지원**: 간단한 서식 도구를 통해 텍스트를 강조하거나 구조화할 수 있습니다.
*   **사용자 인증**: 이메일/비밀번호 및 구글 계정으로 회원가입 및 로그인할 수 있으며, 로그인 상태 유지 옵션을 제공합니다.
*   **공유 기능**: 다른 사용자의 이메일을 통해 메모를 공유하고 실시간으로 협업할 수 있습니다.
*   **검색 기능**: 키워드를 통해 저장된 메모와 체크리스트 항목을 실시간으로 검색하며, 일치하는 단어가 하이라이트됩니다.
*   **보관함 및 휴지통**: 메인 화면을 깔끔하게 유지하기 위한 보관 기능과 삭제 후 복원 가능한 휴지통 기능을 제공합니다.
*   **메모 배경색 지정**: 구글 킵 스타일의 12가지 파스텔 톤 색상 팔레트를 제공하며, 다크 모드에서도 가독성이 유지되는 적응형 색상을 지원합니다.
*   **라벨 관리 및 필터링**: 메모에 라벨을 추가하여 분류하고, 사이드바를 통해 특정 라벨의 메모만 모아볼 수 있는 필터링 기능을 제공합니다.
*   **로컬 데이터 백업/복구**: 모든 메모와 라벨 데이터를 로컬 파일(.json)로 안전하게 백업하고, 언제든지 복구할 수 있습니다.
*   **다크 모드 및 반응형**: 눈의 피로를 줄이는 다크 모드와 다양한 모바일 기기에 최적화된 레이아웃을 제공합니다.

---

## 🛠 기술 스택

### Frontend
*   **Core**: React 18, Vite
*   **Routing**: React Router v7
*   **Styling**: CSS Modules, React Icons
*   **UI/UX**: SweetAlert2 (alert), Masonry Layout

### Backend
*   **Firebase**:
    *   Authentication: 사용자 인증
    *   Cloud Firestore: NoSQL 데이터베이스
    *   Storage: 이미지 저장
    *   Hosting: 정적 웹 호스팅

### Performance Optimization
*   **Code Splitting**: `React.lazy`로 페이지별 코드 분할
*   **Image Lazy Loading**: 스크롤에 따른 이미지 지연 로딩
*   **Build Optimization**: Vite `manualChunks`로 벤더 청크 분리

---

## 📂 폴더 구조

```
AdvanceKeep/
├── public/                  # 정적 파일 (이미지, 아이콘, favicon.svg 등)
│
├── src/
│   ├── assets/              # 프로젝트 내에서 사용되는 로컬 이미지 리소스
│   │
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── common/          # 버튼, 모달 등 범용 컴포넌트
│   │   ├── features/        # 핵심 기능 컴포넌트 (NoteCard, NoteForm 등)
│   │   └── layout/          # 레이아웃 컴포넌트 (Sidebar, Header, Layout)
│   │
│   ├── constants/           # 상수 모음 (메뉴명, 색상 팔레트 등)
│   │
│   ├── hooks/               # 커스텀 React Hooks
│   │   ├── useAuth.jsx      # 인증 상태 관리
│   │   ├── useNotes.js      # 메모 CRUD 및 실시간 동기화 로직
│   │   └── useImageUpload.js # 이미지 업로드 및 변환 로직
│   │
│   ├── pages/               # 라우팅 페이지 컴포넌트
│   │   ├── Home.jsx         # 메인 메모 목록 및 라벨 필터링 뷰
│   │   ├── Login.jsx        # 로그인 및 회원가입
│   │   └── Trash.jsx, Archive.jsx # 휴지통, 보관함
│   │
│   ├── services/            # 외부 서비스 연동
│   │   ├── api.js           # Firebase Firestore 데이터베이스 연동
│   │   └── auth.js          # Firebase Authentication 인증 연동
│   │
│   ├── utils/               # 유틸리티 함수 (날짜 변환, 에러 처리 등)
│   ├── App.jsx              # 앱 라우팅 및 전역 상태 공급 (Context Provider)
│   ├── index.css            # 전역 스타일 및 CSS 변수 (다크모드 포함)
│   └── main.jsx             # React 앱 진입점 (DOM 렌더링)
│
├── index.html               # HTML 진입점
├── package.json             # 프로젝트 의존성 및 스크립트 정보
├── firebase.json            # Firebase Hosting 및 Firestore 설정
└── vite.config.js           # Vite 빌드 도구 설정
```

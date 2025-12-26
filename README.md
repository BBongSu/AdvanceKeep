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
*   **메모 고정**: 중요한 메모를 상단에 고정하여 빠르게 접근할 수 있습니다.
*   **이미지 첨부 및 확대**: 메모에 이미지를 첨부하고(Firebase Storage), 클릭 시 전체 화면으로 확대(Lightbox)하여 볼 수 있습니다.
*   **리스트 뷰 / 그리드 뷰**: 사용자의 선호에 따라 메모 목록을 리스트 형태 또는 그리드 형태로 전환하여 볼 수 있습니다.
*   **마크다운 지원**: 간단한 서식 도구를 통해 텍스트를 강조하거나 구조화할 수 있습니다.
*   **사용자 인증**: 이메일/비밀번호 및 구글 계정으로 회원가입 및 로그인할 수 있으며, 로그인 상태 유지 옵션을 제공합니다.
*   **공유 기능**: 다른 사용자의 이메일을 통해 메모를 공유하고 실시간으로 협업할 수 있습니다.
*   **검색 기능**: 키워드를 통해 저장된 메모를 실시간으로 검색하며, 일치하는 단어가 하이라이트됩니다.
*   **보관함 및 휴지통**: 메인 화면을 깔끔하게 유지하기 위한 보관 기능과 삭제 후 복원 가능한 휴지통 기능을 제공합니다.
*   **메모 배경색 지정**: 구글 킵 스타일의 12가지 파스텔 톤 색상 팔레트를 제공하며, 메모의 성격에 따라 배경색을 자유롭게 지정할 수 있습니다.
*   **라벨 관리 및 필터링**: 메모에 라벨을 추가하여 분류하고, 사이드바를 통해 특정 라벨의 메모만 모아볼 수 있는 필터링 기능을 제공합니다.
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
├── public/              # 정적 파일 (이미지, 아이콘 등)
├── src/
│   ├── assets/          # 프로젝트 내에서 사용되는 이미지 및 리소스
│   ├── components/      # 재사용 가능한 UI 컴포넌트
│   │   ├── common/      # 공통 컴포넌트 (버튼, 입력창 등)
│   │   ├── features/    # 기능별 컴포넌트 (메모 카드, 폼 등)
│   │   └── layout/      # 레이아웃 컴포넌트 (헤더, 사이드바 등)
│   ├── constants/       # 상수 설정 (index.js)
│   ├── hooks/           # 커스텀 React Hooks (useNotes, useSearch 등)
│   ├── pages/           # 라우팅 페이지 (Home, Archive, Trash 등)
│   ├── services/        # API 통신 및 비즈니스 로직 (api.js, auth.js)
│   ├── utils/           # 유틸리티 함수
│   ├── App.jsx          # 메인 앱 컴포넌트
│   └── main.css         # 메인 css
│   └── main.jsx         # 진입점 (Entry Point)
├── index.html           # HTML 템플릿
├── package.json         # 프로젝트 의존성 및 스크립트 설정
├── firebase.json        # FireBase 설정
└── vite.config.js       # Vite 설정 파일
```

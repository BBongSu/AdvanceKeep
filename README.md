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

*   **메모 관리**: 제목과 내용으로 구성된 메모를 자유롭게 작성, 수정, 삭제할 수 있습니다.
*   **메모 고정**: 중요한 메모를 상단에 고정하여 빠르게 접근할 수 있습니다.
*   **이미지 첨부**: 메모에 여러 장의 이미지를 첨부하여 시각적으로 기록할 수 있습니다 (Firebase Storage 사용).
*   **이미지 확대**: 첨부된 이미지를 클릭하여 전체 화면으로 확대하고, 여러 이미지를 탐색할 수 있습니다.
*   **리스트 뷰 / 그리드 뷰**: 사용자의 선호에 따라 메모 목록을 리스트 형태 또는 그리드(Masonry) 형태로 전환하여 볼 수 있습니다.
*   **마크다운 지원**: 간단한 마크다운 문법을 지원하여 텍스트를 강조하거나 구조화할 수 있습니다.
*   **사용자 인증**: 회원가입 및 로그인 기능을 통해 개인화된 메모 관리를 제공합니다 (Firebase Authentication).
*   **공유 기능**: 다른 사용자의 이메일을 통해 메모를 공유하고 협업할 수 있습니다.
*   **검색 기능**: 키워드를 통해 저장된 메모를 실시간으로 빠르게 검색할 수 있으며, 일치하는 검색어가 하이라이트되어 쉽게 찾을 수 있습니다.
*   **보관함 (Archive)**: 당장 필요하지 않은 메모를 보관함으로 이동시켜 메인 화면을 깔끔하게 유지할 수 있습니다.
*   **휴지통 (Trash)**: 삭제한 메모를 임시 보관하며, 필요 시 복원하거나 영구 삭제할 수 있습니다.
*   **반응형 레이아웃**: 다양한 화면 크기에 최적화된 반응형 디자인을 제공합니다.
*   **다크 모드**: 눈의 피로를 줄이는 다크 모드를 지원합니다.

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

---

## 📂 폴더 구조

```
AdvanceKeep/
├── public/              # 정적 파일 (이미지, 아이콘 등)
├── server/              # 백엔드 관련 파일 (db.json 등)
├── src/
│   ├── assets/          # 프로젝트 내에서 사용되는 이미지 및 리소스
│   ├── components/      # 재사용 가능한 UI 컴포넌트
│   │   ├── common/      # 공통 컴포넌트 (버튼, 입력창 등)
│   │   ├── features/    # 기능별 컴포넌트 (메모 카드, 폼 등)
│   │   └── layout/      # 레이아웃 컴포넌트 (헤더, 사이드바 등)
│   ├── hooks/           # 커스텀 React Hooks (useNotes, useSearch 등)
│   ├── pages/           # 라우팅 페이지 (Home, Archive, Trash 등)
│   ├── services/        # API 통신 및 비즈니스 로직 (api.js, auth.js)
│   ├── utils/           # 유틸리티 함수
│   ├── App.jsx          # 메인 앱 컴포넌트
│   └── main.jsx         # 진입점 (Entry Point)
├── index.html           # HTML 템플릿
├── package.json         # 프로젝트 의존성 및 스크립트 설정
└── vite.config.js       # Vite 설정 파일
```

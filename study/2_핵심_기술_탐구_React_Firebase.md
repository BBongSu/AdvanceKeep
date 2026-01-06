# 2. 핵심 기술 탐구: React & Firebase

이 문서는 AdvanceKeep의 엔진에 해당하는 React의 고급 기능들과 Firebase의 데이터 모델링에 대해 다룹니다.

## 1. React 심화 (Advanced React)

### 1.1 Custom Hooks (`src/hooks/`)
반복되는 로직을 재사용하기 위해 함수형 컴포넌트에서 로직을 추출했습니다.
*   **`useAuth`**: 로그인 상태(User), 로그인/로그아웃 함수를 전역에서 쉽게 접근하게 해줍니다.
*   **`useNotes`**: 메모의 CRUD(Create, Read, Update, Delete) 로직과 상태 관리를 캡슐화했습니다.

### 1.2 Context API
컴포넌트 트리 깊은 곳까지 `props`를 일일이 전달하는 'Prop Drilling' 문제를 해결하기 위해 사용했습니다.
*   **AuthContext**: 사용자 정보(`user`)는 앱의 거의 모든 곳(헤더, 메모 카드, 사이드바 등)에서 필요하므로 Context로 관리하여 어디서든 `useAuth()`로 접근 가능하게 만들었습니다.

### 1.3 State Management
별도의 Redux나 Zustand 같은 라이브러리 없이, React 내장 기능(`useState`, `useContext`)만으로 상태를 관리했습니다. 규모가 커지면 라이브러리가 필요하지만, 현재 규모에서는 오버엔지니어링을 피하기 위해 내장 기능에 집중했습니다.

## 2. Firebase & NoSQL 모델링

### 2.1 Firestore (NoSQL Document DB)
전통적인 SQL(관계형 DB)과 달리, JSON 문서 형태로 데이터를 저장합니다.

*   **Collection (테이블)**: `notes`, `users`, `labels`
*   **Document (행)**: 각 메모나 사용자 데이터 객체

### 2.2 데이터 모델링 전략
AdvanceKeep은 **비정규화(Denormalization)** 패턴을 일부 적용하거나, **참조(Reference)** 패턴을 혼합했습니다.

*   **공유 기능 (M:N 관계)**:
    *   하나의 메모는 여러 명과 공유될 수 있고(`sharedWith: ['uid1', 'uid2']`), 한 명은 여러 공유 메모를 가질 수 있습니다.
    *   이를 구현하기 위해 사용자의 `uid`를 배열(`array`) 필드로 저장하고, 쿼리 시 `array-contains` 필터를 사용하여 "내가 포함된 메모"를 고속으로 조회합니다.

### 2.3 실시간 동기화 (`onSnapshot`)
Firebase의 가장 강력한 기능인 리스너입니다. `src/services/api.js`의 `subscribeNotes` 함수를 보세요.
1.  앱이 켜지면 DB에 "소켓"을 연결합니다.
2.  데이터가 변경(누군가 공유함, PC에서 수정함 등)되면 서버가 즉시 변경사항을 앱으로 푸시합니다.
3.  앱은 새로고침 없이 즉시 화면을 갱신합니다.

## 3. 인증 (Authentication)
*   **Observer Pattern**: `onAuthStateChanged` 리스너를 통해, 브라우저/앱이 껐다 켜져도 로그인 세션이 유지되는지 실시간으로 감시하고 상태를 복구합니다.
*   **Hybrid Auth**: 웹에서는 팝업 방식, 모바일(Capacitor)에서는 네이티브 SDK 방식을 분기 처리하여 UX를 최적화했습니다.

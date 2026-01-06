# 3. 모바일 앱 전환 기술: Capacitor

웹 개발자가 네이티브 앱 개발자로 거듭나는 과정에서 핵심적인 역할을 한 Capacitor 기술에 대한 심층 분석입니다.

## 1. 하이브리드 앱의 원리
AdvanceKeep은 **WebView** 기반의 하이브리드 앱입니다.
*   **껍데기**: Android(Java/Kotlin) 또는 iOS(Swift/Obj-C) 네이티브 컨테이너
*   **알맹이**: 우리가 만든 React 웹사이트 (HTML/CSS/JS)
*   **Capacitor**: 이 둘 사이를 연결하는 **Bridge(다리)** 역할을 합니다. 자바스크립트 코드가 네이티브 기능(카메라, 파일 시스템 등)을 호출할 수 있게 해줍니다.

## 2. 웹 vs 네이티브 차이점 극복
웹사이트를 앱으로 만들 때 발생하는 주요 문제들과 해결책을 학습해 봅시다.

### 2.1 쿠키 및 세션 문제
*   **문제**: 모바일 앱 환경(file:// 프로토콜)에서는 브라우저 쿠키나 `SameSite` 정책이 웹과 다르게 동작하여 로그인이 풀릴 수 있습니다.
*   **해결**: Capacitor 설정(`capacitor.config.ts`)에서 `serverClientId`를 명시하고, Firebase Auth 플러그인을 사용하여 인증 토큰을 네이티브 레이어에서 안전하게 관리합니다.

### 2.2 파일 시스템 접근
*   **웹**: 보안상 사용자의 파일 시스템에 직접 접근 불가 (다운로드만 가능)
*   **앱**: 샌드박스 구조 안에서 파일 읽기/쓰기 가능
*   **구현**: `src/services/backupService.js`에서 플랫폼을 감지(`Capacitor.isNativePlatform()`)하여, 웹이면 `<a>` 태그 다운로드를, 앱이면 `Filesystem` 및 `Share` API를 사용하는 분기 로직을 작성했습니다.

## 3. 네이티브 플러그인 (Native Plugins)
자바스크립트 만으로는 할 수 없는 기능들을 플러그인으로 구현했습니다.

| 플러그인 | 역할 | 학습 포인트 |
| :--- | :--- | :--- |
| **@capacitor/core** | 핵심 브릿지 | JS와 네이티브 간 통신 담당 |
| **@capacitor/share** | 공유 시트 | 안드로이드/iOS 고유의 공유 창을 띄움 (카카오톡, 문자 등 전송) |
| **@capacitor/filesystem** | 파일 저장 | 백업 파일을 기기 내부 저장소에 기록 |
| **@codetrix-studio/google-auth** | 구글 로그인 | 웹뷰 로그인이 아닌, 폰에 저장된 구글 계정으로 원터치 로그인 |

## 4. 빌드 파이프라인 (Build Pipeline)
1.  **`npm run build`**: React 코드를 `dist` 폴더에 HTML/CSS/JS로 번들링(압축)합니다.
2.  **`npx cap sync`**:
    *   `dist`의 내용을 네이티브 프로젝트 폴더(`android/app/src/main/assets/public`)로 복사합니다.
    *   설치된 플러그인들의 네이티브 코드를 안드로이드 프로젝트에 주입합니다.
3.  **Android Studio Build**: Gradle(빌드 도구)이 자바 코드와 리소스, 웹 에셋을 하나로 묶어 `.apk`를 생성합니다.

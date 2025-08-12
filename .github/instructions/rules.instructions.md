# KLP Community 지침

## 파일 명명 규칙

- 앱 페이지의 파일은 kebab-case로 작성합니다.
  - 예: `post-write.tsx`, `home.tsx`, `login.tsx`.
- 컴포넌트 파일은 PascalCase로 작성합니다.
  - 예: `AppButton.tsx`, `PostCard.tsx`.

## 유지보수 규칙

- 재활용 가능한 컴포넌트는 `components` 폴더에 위치시킵니다.
- 페이지 관련 파일은 `app` 폴더에 위치시킵니다.
  - tab관련 파일은 `app/(tabs)` 폴더에 위치시킵니다.
  - page관련 파일은 `app/(pages)` 폴더에 위치시킵니다.
- 타입 관련 파일은 `types` 폴더에 위치시킵니다.
- 재활용 가능한 코드의 경우 `hooks` 폴더에 위치시킵니다.
  - 예: `useAuth.ts`, `usePosts.ts`.
- 변수 타입의 경우 `any`를 사용하지 않고, 구체적인 타입을 지정합니다.
- fetch 데이터 타입의 경우 `...ResponseParams`, `...RequestParams`와 같이 명명합니다.
- 공통적으로 쓰이는 컴포넌트는 해당 컴포넌트 이름 그대로 사용하며 `components/common` 폴더에 위치시킵니다.
  - 예: `Button.tsx`, `TextInput.tsx`.

## 성능 일관성

- `useEffect` 훅을 사용하여 Firebase에서 fetch되는 데이터는 한번만 호출합니다.

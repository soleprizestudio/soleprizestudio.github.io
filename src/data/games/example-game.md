---
title: 예시 게임
teaser: 게임 페이지가 어떻게 동작하는지 보여주는 플레이스홀더입니다. 실제 게임으로 교체해주세요.
playPath: /play/example-game/index.html
---

이건 플레이스홀더 게임 항목입니다. 구조를 보여주기 위한 것으로, 이 마크다운 파일
(`src/data/games/` 안에 있음)이 제목과 설명을 담고 있고, `playPath`가
`/play/example-game/index.html`에 있는 실제 웹 빌드를 가리킵니다.

**실제 게임을 추가하려면:**

1. 웹 빌드를 export 하세요 (예: Unity WebGL이라면 **Compression Format을
   "Disabled"**로 설정 — GitHub Pages는 기본 gzip/brotli 압축 빌드 파일을
   제대로 서빙하지 못합니다) → `public/play/<게임-슬러그>/`에 넣기.
2. 이 파일을 `src/data/games/<게임-슬러그>.md`로 복사해서 `title`, `teaser`,
   `playPath`를 맞게 바꿉니다. `playPath`는 빌드의 `index.html`까지 전체 경로로
   적어주세요 (예: `/play/<게임-슬러그>/index.html`) — 사이트가 trailing slash를
   안 쓰도록 설정돼 있어서, 폴더 경로만 적으면 404가 날 수 있습니다.
3. 목록 페이지용으로 `thumbnail: /images/<이미지파일>.png` 필드를 추가해도
   됩니다 (선택, `public/images/`에 넣어두면 됨).
4. 커밋하고 push하면 `/games`에 자동으로 반영됩니다.

---
layout: game
title: Example Game
teaser: A placeholder entry showing how a game page works. Replace this with your first real build.
play_path: /play/example-game/
---

This is a placeholder game entry. It exists to show the structure: this markdown
file (in `_games/`) holds the title and description, and the `play_path` points to
the raw web build living under `/play/example-game/`.

**To add a real game:**

1. Export your web build (e.g. Unity WebGL with **Compression Format set to
   "Disabled"** — GitHub Pages can't serve the default gzip/brotli compressed
   build files) into `/play/<your-game-slug>/`.
2. Copy this file to `_games/<your-game-slug>.md` and update `title`, `teaser`,
   and `play_path` to match.
3. Optionally add a `thumbnail: /assets/img/<your-image>.png` field for the
   games listing page.
4. Commit and push — it'll show up on `/games` automatically.

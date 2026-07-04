---
layout: page
title: "게임"
subheadline: "브라우저에서 바로 플레이할 수 있는 웹 게임 프로토타입"
permalink: "/games/"
header:
  title: "게임"
  background-color: "#16324f"
---

<div class="row">
  {% for game in site.games %}
  <div class="medium-4 columns" style="margin-bottom: 2rem;">
    <a href="{{ game.url | relative_url }}">
      {% if game.thumbnail %}
        <img src="{{ game.thumbnail | relative_url }}" alt="{{ game.title }} 썸네일" style="width: 100%; border-radius: 4px;">
      {% endif %}
      <h3>{{ game.title }}</h3>
    </a>
    <p>{{ game.teaser }}</p>
  </div>
  {% else %}
  <p>아직 등록된 게임이 없어요 — 곧 올라올 예정입니다!</p>
  {% endfor %}
</div>

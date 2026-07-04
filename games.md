---
layout: page
title: Games
subtitle: Playable web-build prototypes, right in your browser
---

<div class="row">
  {% for game in site.games %}
  <div class="col-md-4" style="margin-bottom: 2rem;">
    <a href="{{ game.url | relative_url }}">
      {% if game.thumbnail %}
        <img src="{{ game.thumbnail | relative_url }}" alt="{{ game.title }} thumbnail" style="width: 100%; border-radius: 4px;">
      {% endif %}
      <h3>{{ game.title }}</h3>
    </a>
    <p>{{ game.summary }}</p>
  </div>
  {% else %}
  <p>No games posted yet — check back soon!</p>
  {% endfor %}
</div>

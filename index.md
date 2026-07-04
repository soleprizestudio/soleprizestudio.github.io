---
#
# Use the widgets beneath and the content will be
# inserted automagically in the webpage. To make
# this work, you have to use › layout: frontpage
#
layout: frontpage
header:
  title: "SolePrize Studio"
  background-color: "#16324f"
  caption: "앱, 게임, 그리고 웹 실험들 — 만드는 과정을 그대로 공개합니다."
widget1:
  title: "게임"
  url: '/games/'
  text: '브라우저에서 바로 플레이할 수 있는 웹 게임 프로토타입들.'
widget2:
  title: "블로그"
  url: '/blog/'
  text: '스튜디오의 개발기와 소식을 전해드립니다.'
widget3:
  title: "소개"
  url: '/about/'
  text: "저희가 누구고, 무엇을 만들고 있는지."
#
# Use the call for action to show a button on the frontpage
#
callforaction:
  url: /about/
  text: 스튜디오 더 알아보기 ›
  style: alert
permalink: /index.html
#
# This is a nasty hack to make the navigation highlight
# this page as active in the topbar navigation
#
homepage: true
---

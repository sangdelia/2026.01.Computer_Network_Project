#!/bin/bash
set -e

# Git 설정
git config user.name "v0[bot]"
git config user.email "v0[bot]@users.noreply.github.com"

# 모든 변경사항 스테이징
git add .

# 변경사항 커밋
git commit -m "feat: 온라인 설전 플랫폼 목업 페이지 구현

- 의견 목록 화면 (왼쪽) / 의견 상세 화면 (오른쪽) 분할 레이아웃
- 공감/비공감 반응 시스템
- 댓글 기능
- 의견 작성 모달
- Next.js, TypeScript, Tailwind CSS로 구현

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>"

# 현재 브랜치에 푸시
git push origin HEAD

echo "✅ 변경사항이 GitHub에 푸시되었습니다!"
echo "📲 Vercel에서 자동으로 배포가 시작됩니다."

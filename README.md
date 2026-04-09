# 온라인 설전 플랫폼 - 목업

다양한 주제에 대해 의견을 나누고 공감/비공감 반응과 댓글로 토론하는 온라인 설전 플랫폼의 목업 페이지입니다.

## 프로젝트 구조

```
.
├── app/                      # Next.js 앱 라우터
│   ├── layout.tsx           # 레이아웃
│   ├── page.tsx             # 메인 페이지
│   └── globals.css          # 전역 스타일
├── components/              # React 컴포넌트
│   ├── topic-header.tsx     # 주제 헤더
│   ├── sort-tab.tsx         # 정렬 탭
│   ├── opinion-card.tsx     # 의견 카드
│   ├── opinion-list.tsx     # 의견 목록
│   ├── opinion-detail.tsx   # 의견 상세
│   ├── reaction-bar.tsx     # 반응 바
│   ├── comment-item.tsx     # 댓글 항목
│   ├── comment-list.tsx     # 댓글 목록
│   ├── comment-input.tsx    # 댓글 입력
│   ├── write-button.tsx     # 작성 버튼
│   └── write-modal.tsx      # 작성 모달
├── lib/
│   ├── types.ts             # 타입 정의
│   ├── utils.ts             # 유틸 함수
│   └── mock-data.ts         # 목 데이터
├── package.json             # 의존성
├── tailwind.config.ts       # Tailwind 설정
├── tsconfig.json            # TypeScript 설정
└── next.config.ts           # Next.js 설정
```

## 주요 기능

- **의견 목록 화면**: 왼쪽에 의견 요약 카드 목록 표시
- **의견 상세 화면**: 오른쪽에 선택된 의견의 전문, 반응, 댓글 표시
- **정렬 기능**: 최신순/인기순 전환
- **반응 시스템**: 공감/비공감 버튼 및 공감률 표시
- **댓글 기능**: 의견에 대한 댓글 작성 및 표시
- **의견 작성**: 플로팅 버튼을 통한 새로운 의견 작성

## 기술 스택

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Package Manager**: npm

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 배포

이 프로젝트는 Vercel에서 자동으로 배포됩니다. 메인 브랜치로 푸시하면 자동 배포가 트리거됩니다.

## 라이선스

이 프로젝트는 비공개 프로젝트입니다.

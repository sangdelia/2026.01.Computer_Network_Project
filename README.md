# Daily Issues — 온라인 토론 플랫폼

매일 갱신되는 시사 주제에 의견을 작성하고, 공감·비공감 반응과 댓글로 토론하는 풀스택 웹 서비스입니다.

> 군산대학교 소프트웨어학과 컴퓨터 네트워크 팀 프로젝트 · 2026.04 · 2101018 조규상

---

## 기술 스택

| 계층 | 기술 |
|------|------|
| 응용 (L7) | Next.js 15, React 19, Tailwind CSS, REST API |
| 표현 (L6) | UTF-8 인코딩, JSON 직렬화 |
| 세션 (L5) | localStorage 기반 사용자 세션 |
| 전송 (L4) | TCP · mysql2 커넥션 풀 · 포트 3000/3306 |
| 네트워크 (L3) | IP 라우팅 · Cloudflare Tunnel |
| 데이터베이스 | MySQL 8.0 |

---

## 주요 기능

- 회원가입 / 로그인 / 로그아웃
- 의견 작성 · 수정 · 삭제 (본인 게시물에 한함)
- 의견 정렬 (최신순 · 인기순)
- 공감 / 비공감 반응 (토글 · 전환 · 자기 게시물 차단)
- 댓글 작성 / 삭제
- MySQL 실시간 연동
- Cloudflare Tunnel 외부 공개

---

## 프로젝트 구조

```
.
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts       # 로그인
│   │   │   └── signup/route.ts      # 회원가입
│   │   ├── opinions/
│   │   │   ├── route.ts             # 의견 목록/작성
│   │   │   └── [id]/
│   │   │       ├── route.ts         # 의견 수정/삭제
│   │   │       ├── comments/route.ts  # 댓글 조회/작성
│   │   │       └── reactions/route.ts # 반응 처리
│   │   ├── comments/[id]/route.ts   # 댓글 삭제
│   │   └── topics/route.ts          # 토론 주제 목록
│   ├── topic/[id]/page.tsx          # 토론 상세 페이지
│   ├── signup/page.tsx              # 회원가입 페이지
│   ├── page.tsx                     # 메인 (토론 주제 목록)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── post-it.tsx                  # 포스트잇 컴포넌트
├── lib/
│   ├── db.ts                        # MySQL 커넥션 풀
│   ├── types.ts                     # 타입 정의
│   └── utils.ts                     # 유틸 함수
├── docs/
│   ├── Daily Issues 중간발표.pptx   # 중간발표 자료
│   └── 발표_예상질문.txt            # 예상 질문 및 답변
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 데이터베이스 스키마

```sql
users      : id, email, password, nickname
topics     : id, title, created_at
opinions   : id, topic_id, author_id, summary, content,
             agree_count, disagree_count, comment_count
comments   : id, opinion_id, author_id, content, created_at
reactions  : opinion_id + user_id (UNIQUE), type (AGREE/DISAGREE)
```

---

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env.local)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=debate_platform

# 개발 서버 실행
npm run dev
```

### 외부 공개 (Cloudflare Tunnel)

```bash
# 설치 (최초 1회)
winget install --id Cloudflare.cloudflared

# 터널 실행
cloudflared tunnel --url http://localhost:3000
```

---

## 향후 계획

- JWT 인증 + bcrypt 비밀번호 해싱
- 반응형 웹 (모바일·태블릿 대응)
- 비로그인 접근 제한
- WebSocket 실시간 알림
- PM2 상시 운영
- AI 토론 주제 자동 생성

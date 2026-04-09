# MySQL 연동 가이드 (Next.js + MySQL)

## 기술 스택 구성

```
Next.js (App Router)
  └─ API Routes (/app/api/*)
       └─ mysql2 (Node.js MySQL 드라이버)
            └─ MySQL 8.x
```

---

## 1. 패키지 설치

```bash
npm install mysql2
npm install -D @types/node
```

> `mysql2`는 Promise 기반 API를 내장 지원하므로 별도 래퍼 불필요

---

## 2. 환경변수 설정

프로젝트 루트에 `.env.local` 생성:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=debate_platform
```

> `.env.local`은 `.gitignore`에 이미 포함 — 절대 커밋 금지

---

## 3. DB 연결 풀 설정

`lib/db.ts` 파일 생성:

```typescript
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
```

> Connection Pool 사용 이유: 매 요청마다 연결을 새로 맺으면 느림. 풀은 연결을 재사용.

---

## 4. MySQL 스키마 생성

MySQL에서 아래 SQL 실행:

```sql
CREATE DATABASE IF NOT EXISTS debate_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE debate_platform;

CREATE TABLE topics (
  id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nickname   VARCHAR(50)  NOT NULL UNIQUE,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE opinions (
  id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  topic_id        BIGINT       NOT NULL,
  author_id       BIGINT       NOT NULL,
  summary         VARCHAR(200) NOT NULL,
  content         TEXT         NOT NULL,
  agree_count     INT          NOT NULL DEFAULT 0,
  disagree_count  INT          NOT NULL DEFAULT 0,
  comment_count   INT          NOT NULL DEFAULT 0,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id)  REFERENCES topics(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE reactions (
  id          BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  opinion_id  BIGINT NOT NULL,
  user_id     BIGINT NOT NULL,
  type        ENUM('AGREE', 'DISAGREE') NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_reaction (opinion_id, user_id),
  FOREIGN KEY (opinion_id) REFERENCES opinions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)
);

CREATE TABLE comments (
  id          BIGINT   NOT NULL AUTO_INCREMENT PRIMARY KEY,
  opinion_id  BIGINT   NOT NULL,
  author_id   BIGINT   NOT NULL,
  content     TEXT     NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opinion_id) REFERENCES opinions(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id)  REFERENCES users(id)
);

-- 테스트용 초기 데이터
INSERT INTO topics (title) VALUES
  ('대학 등록금은 인하되어야 하는가?'),
  ('AI가 인간의 일자리를 대체해도 괜찮은가?'),
  ('SNS 실명제를 도입해야 하는가?'),
  ('군 복무 기간을 단축해야 하는가?'),
  ('대학 입시에서 수능의 비중을 줄여야 하는가?');
```

---

## 5. API Route 작성 예시

### 의견 목록 조회 — `app/api/opinions/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  const sort = searchParams.get("sort") || "latest";

  const orderBy = sort === "popular" ? "agree_count DESC" : "created_at DESC";

  const [rows] = await pool.execute(
    `SELECT o.id, o.summary, u.nickname AS authorNickname,
            o.agree_count AS agreeCount, o.comment_count AS commentCount, o.created_at AS createdAt
     FROM opinions o
     JOIN users u ON o.author_id = u.id
     WHERE o.topic_id = ?
     ORDER BY ${orderBy}`,
    [topicId]
  );

  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { topicId, authorId, summary, content } = body;

  const [result] = await pool.execute(
    `INSERT INTO opinions (topic_id, author_id, summary, content) VALUES (?, ?, ?, ?)`,
    [topicId, authorId, summary, content]
  ) as any;

  return NextResponse.json({ success: true, data: { id: result.insertId } }, { status: 201 });
}
```

### 반응(공감/비공감) — `app/api/opinions/[id]/reactions/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const opinionId = Number(params.id);
  const { userId, type } = await req.json();

  const [existing] = await pool.execute(
    `SELECT id, type FROM reactions WHERE opinion_id = ? AND user_id = ?`,
    [opinionId, userId]
  ) as any;

  if (existing.length > 0) {
    if (existing[0].type === type) {
      // 같은 반응 → 취소
      await pool.execute(`DELETE FROM reactions WHERE id = ?`, [existing[0].id]);
      await pool.execute(
        `UPDATE opinions SET ${type === "AGREE" ? "agree_count" : "disagree_count"} = 
         ${type === "AGREE" ? "agree_count" : "disagree_count"} - 1 WHERE id = ?`,
        [opinionId]
      );
    } else {
      // 반응 전환
      await pool.execute(`UPDATE reactions SET type = ? WHERE id = ?`, [type, existing[0].id]);
      const dec = existing[0].type === "AGREE" ? "agree_count" : "disagree_count";
      const inc = type === "AGREE" ? "agree_count" : "disagree_count";
      await pool.execute(`UPDATE opinions SET ${dec} = ${dec} - 1, ${inc} = ${inc} + 1 WHERE id = ?`, [opinionId]);
    }
  } else {
    // 새 반응
    await pool.execute(`INSERT INTO reactions (opinion_id, user_id, type) VALUES (?, ?, ?)`, [opinionId, userId, type]);
    await pool.execute(
      `UPDATE opinions SET ${type === "AGREE" ? "agree_count" : "disagree_count"} = 
       ${type === "AGREE" ? "agree_count" : "disagree_count"} + 1 WHERE id = ?`,
      [opinionId]
    );
  }

  const [[opinion]] = await pool.execute(
    `SELECT agree_count AS agreeCount, disagree_count AS disagreeCount FROM opinions WHERE id = ?`,
    [opinionId]
  ) as any;

  return NextResponse.json({ success: true, data: { ...opinion } });
}
```

---

## 6. 프론트엔드 연동 (mock → API 전환)

기존 mock 데이터 호출을 `fetch`로 교체:

```typescript
// Before (mock)
import { mockOpinions } from "@/lib/mock-data";

// After (API)
const res = await fetch(`/api/opinions?topicId=${topicId}&sort=${sort}`);
const { data } = await res.json();
```

---

## 7. 연동 순서 체크리스트

- [ ] MySQL 서버 로컬 설치 및 실행 확인
- [ ] `.env.local` 작성
- [ ] `npm install mysql2` 완료
- [ ] `lib/db.ts` 생성
- [ ] MySQL에서 스키마 SQL 실행
- [ ] API Route 파일 작성
- [ ] 프론트엔드에서 fetch로 교체
- [ ] `npm run dev` 후 동작 확인

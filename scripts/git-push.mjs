import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

try {
  process.chdir(projectRoot);

  console.log('📝 Git 설정 중...');
  execSync('git config user.name "v0[bot]"', { stdio: 'inherit' });
  execSync('git config user.email "v0[bot]@users.noreply.github.com"', { stdio: 'inherit' });

  console.log('📦 변경사항 스테이징 중...');
  execSync('git add .', { stdio: 'inherit' });

  console.log('💾 변경사항 커밋 중...');
  execSync(
    `git commit -m "feat: 온라인 설전 플랫폼 목업 페이지 구현

- 의견 목록 화면 (왼쪽) / 의견 상세 화면 (오른쪽) 분할 레이아웃
- 공감/비공감 반응 시스템
- 댓글 기능
- 의견 작성 모달
- Next.js, TypeScript, Tailwind CSS로 구현

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>"`,
    { stdio: 'inherit' }
  );

  console.log('🚀 GitHub에 푸시 중...');
  execSync('git push origin HEAD', { stdio: 'inherit' });

  console.log('✅ 변경사항이 GitHub에 푸시되었습니다!');
  console.log('📲 Vercel에서 자동으로 배포가 시작됩니다.');
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
  process.exit(1);
}

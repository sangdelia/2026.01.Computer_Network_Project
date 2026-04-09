#!/usr/bin/env python3
import subprocess
import os
import sys

def run_command(cmd, description):
    """명령어 실행"""
    print(f"{description}")
    try:
        # HOME 환경변수 설정
        env = os.environ.copy()
        env['HOME'] = '/home/user'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, env=env)
        if result.returncode != 0 and "already exists" not in result.stderr:
            print(f"   {result.stderr.strip()}")
        else:
            print(f"   ✓")
        return result.returncode == 0
    except Exception as e:
        print(f"   ❌ 오류: {e}")
        return False

# 프로젝트 루트 디렉토리로 이동 (현재 경로 기준)
os.chdir('.')

# Git 저장소 초기화
print("📝 Git 저장소 초기화 중...")
run_command('git init', "   - git init")

# Git 설정
print("⚙️ Git 설정 중...")
run_command('git config user.name "v0[bot]"', "   - 사용자 이름 설정")
run_command('git config user.email "v0[bot]@users.noreply.github.com"', "   - 이메일 설정")

# 원격 저장소 추가
print("🌐 원격 저장소 설정 중...")
run_command('git remote add origin https://github.com/sangdelia/2026.01.Computer_Network_Project.git', "   - 원격 저장소 추가")

# 변경사항 스테이징
print("📦 변경사항 스테이징 중...")
run_command('git add .', "   - 모든 파일 추가")

# 커밋 메시지 작성
commit_msg = """feat: 온라인 설전 플랫폼 목업 페이지 구현

- 의견 목록 화면 (왼쪽) / 의견 상세 화면 (오른쪽) 분할 레이아웃
- 공감/비공감 반응 시스템
- 댓글 기능
- 의견 작성 모달
- Next.js, TypeScript, Tailwind CSS로 구현

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>"""

# 커밋
print("💾 변경사항 커밋 중...")
run_command(f'git commit -m "{commit_msg}"', "   - 커밋 생성")

# 푸시
print("🚀 GitHub에 푸시 중...")
run_command('git push origin main -f', "   - main 브랜치 푸시")

print("\n✅ 완료!")
print("📲 Vercel에서 자동으로 배포가 시작됩니다.")



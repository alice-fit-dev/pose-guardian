# Pose Guardian — Claude 컨텍스트

## 프로젝트
웨이트 트레이닝 자세 실시간 진단 React PWA. 어깨 부상 원인 파악이 출발점, 범위는 웨이트 전반.

## 핵심 방향
- **구현 대상**: `web/` 디렉토리의 React + Vite PWA
- **포즈 감지**: TensorFlow.js + MoveNet Lightning (사용자 폰에서 추론, 서버 없음)
- **배포**: Vercel (무료, 자동 HTTPS)
- **1차 운동**: 스쿼트, 데드리프트, 벤치프레스
- **연동 대상**: `../my-fit-ai-app` (기존 Streamlit 앱, 멀티 AI 프로바이더)

## Python 코드 (`src/`) 처우
참고용으로만 유지. 수정하거나 실행하려 하지 말 것.
어깨 분석 임계값 (shoulder.py) 및 각도 계산 로직 (angles.py)은 JS 구현 시 참고.

## 개발 환경
- 카메라: Intel RealSense → Mac Mini USB → localhost (HTTPS 불필요)
- 모바일 테스트: Vercel 배포 후 iPhone (폰에 인증서 설치 금지)
- ngrok 사용 금지 (보안 이슈)

## 운동별 분석 모듈 구조
각 운동은 독립 모듈로 분리:
- `web/src/analysis/squat.js`
- `web/src/analysis/deadlift.js`
- `web/src/analysis/bench.js`
- 추가 운동은 같은 패턴으로 확장

## 관련 문서
- 아키텍처/구조: [owner-readme.md](owner-readme.md)
- 세션 상태/다음 작업: [last-session.md](last-session.md)
- 초기 기획 전체: [doc/pose-guardian-initial.md](doc/pose-guardian-initial.md)

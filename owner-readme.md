# Pose Guardian — 구조 문서

## 프로젝트 목표
웨이트 트레이닝 자세 실시간 진단. 어깨 부상 원인 파악이 출발점이지만 범위는 웨이트 트레이닝 전반.

## 최종 아키텍처

```
사용자 스마트폰 브라우저
  ↓ URL 접속
Vercel (React PWA 파일 제공, 무료)
  ↓ JS 다운로드
폰에서 실행
  → 카메라 ON
  → TensorFlow.js + MoveNet Lightning (폰 내부 추론)
  → 관절 각도 계산 + 자세 판정
  → 피드백 표시
  ↓ (옵션) 관절 각도 데이터만 전송
기존 my-fit-ai-app AI 프로바이더 (Claude / Gemini / OpenRouter / NVIDIA)
```

영상/신체 데이터 외부 전송 없음. 인프라 비용 $0.

## 기술 스택

| 역할 | 기술 |
|---|---|
| 포즈 감지 | TensorFlow.js + MoveNet Lightning |
| UI 프레임워크 | React + Vite (PWA) |
| 배포 | Vercel (무료, GitHub 연동 자동 배포) |
| 기존 앱 연동 | my-fit-ai-app 에서 링크 버튼으로 이동 |

## 개발 단계

### 1차 — RGB only (main 브랜치)
- 기술: TensorFlow.js + MoveNet Lightning (RGB 카메라만 사용)
- 배포: Vercel (브라우저 PWA)
- 운동: 스쿼트, 데드리프트, 벤치프레스
- 이후 렛풀다운 등 추가 운동 확장

### 2차 — Depth 버전 (feature/depth 브랜치)
- 기술: Intel RealSense SDK (librealsense) → Python 백엔드 → 웹앱 연동
- 목적: RGB만으론 못 잡는 관절 가림/각도 오차를 depth로 보정
- 하드웨어: 이미 보유한 RealSense Developer Kit 활용
- 검증 후 main merge 결정

## 디렉토리 구조

```
pose-guardian/
├── web/                    ← React PWA (메인 구현)
│   ├── src/
│   │   ├── analysis/       ← 운동별 분석 모듈
│   │   │   ├── angles.js
│   │   │   ├── squat.js
│   │   │   ├── deadlift.js
│   │   │   └── bench.js
│   │   ├── pose/
│   │   │   └── estimator.js  ← MoveNet 래퍼
│   │   └── components/
│   ├── package.json
│   └── vite.config.js
├── src/                    ← Python 프로토타입 (참고용, 수정 불필요)
├── doc/
│   ├── pose-guardian-initial.md
│   └── owner-readme.md     ← 이 파일
└── models/                 ← MediaPipe 모델 (Python용 참고)
```

## 개발 환경

**로컬 테스트 (카메라 필요 시)**
- Intel RealSense → Mac Mini USB 연결 → `localhost` → 카메라 정상 작동
- HTTPS 불필요 (localhost 면제)

**모바일 테스트**
- Vercel 배포 후 iPhone Safari에서 접속 (Vercel 자동 HTTPS)
- 폰에 인증서 설치 불필요

**개발 서버**
```bash
cd web
npm run dev          # localhost:5173
```

## 기존 앱 연동 계획
my-fit-ai-app Streamlit 앱에 "자세 분석" 버튼 추가 → Vercel URL로 이동
관절 각도 데이터 → 기존 멀티 AI 프로바이더로 피드백 요청

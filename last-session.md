# 마지막 세션 상태

> 새 세션 시작 전 반드시 읽을 것. 세션 종료 전 반드시 업데이트할 것.

---

**날짜:** 2026-05-05

**미커밋 파일:** 없음 (git 미설정)

---

## 오늘 (2026-05-05) 결정사항

1. **방향 확정** — 초기 문서(React PWA + TF.js)대로 진행. Python 코드는 문서 읽기 전에 만든 것, 방향 불일치.
2. **Python 코드 처우** — `src/` 참고용 유지, 수정 불필요. 어깨 분석 로직/임계값 JS 포팅 시 참고.
3. **운동 범위** — 3대 운동(스쿼트, 데드리프트, 벤치) 먼저, 이후 렛풀다운 등 추가. 어깨만이 아닌 웨이트 전반.
4. **개발 단계** — 1차: RGB only (main 브랜치), 2차: RealSense depth 버전 (feature/depth 브랜치)
5. **개발 환경** — RealSense Developer Kit (USB-A) → USB 3.0 A-to-C 어댑터 → Mac Mini. 모바일 테스트는 Vercel 배포 후 iPhone.
6. **RealSense 상태** — 젠북에선 웹캠으로 인식됨 (정상). Mac Mini는 싸구려 USB 2.0 어댑터라 미인식. USB 3.0 어댑터 쿠팡 새벽배송 주문 완료.

## 오늘 (2026-05-05) 완료 작업

- `web/` 디렉토리에 Vite + React 프로젝트 생성
- TensorFlow.js + MoveNet Lightning 설치 및 빌드 성공
- mediapipe ESM 호환 이슈 해결 (`src/stubs/mediapipe-pose.js` + vite alias)
- 운동별 분석 모듈 구현: `squat.js`, `deadlift.js`, `bench.js`
- 스켈레톤 오버레이 (`PoseOverlay.jsx`), 피드백 패널 (`FeedbackPanel.jsx`)
- 운동 선택 UI (`ExerciseSelector.jsx`)
- `http://localhost:5173` 동작 확인 (카메라 없음 상태에서 UI 정상)

## 다음 세션 시작 시

- [ ] USB 3.0 어댑터 도착 확인 → RealSense 연결 → `rs-enumerate-devices`로 인식 확인
- [ ] `npm run dev` → 카메라 연결 → 실제 포즈 감지 테스트
- [ ] 분석 임계값 튜닝 (실제 동작 보면서)
- [ ] PWA manifest 추가 (모바일 설치 가능하게)
- [ ] GitHub 레포 생성 → Vercel 연동

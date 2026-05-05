# 마지막 세션 상태

> 새 세션 시작 전 반드시 읽을 것. 세션 종료 전 반드시 업데이트할 것.

---

**날짜:** 2026-05-05

---

## 결정사항

1. **방향 확정** — 초기 문서(React PWA + TF.js)대로 진행. Python 코드는 문서 읽기 전에 만든 것, 방향 불일치.
2. **Python 코드 처우** — `src/` 참고용 유지, 수정 불필요.
3. **운동 범위** — 3대 운동(스쿼트, 데드리프트, 벤치) 먼저, 이후 렛풀다운 등 추가.
4. **개발 단계** — 1차: RGB only (main), 2차: RealSense depth (feature/depth 브랜치)
5. **테스트 방식** — iPhone으로 운동 동영상 촬영 → 맥미니 영상 업로드로 분석 (카메라 거리 문제 회피)
6. **RealSense** — USB 3.0 어댑터 새벽배송 주문. 도착하면 맥미니 연결 테스트.

## 완료 작업

- Vite + React PWA 구조 (`web/`)
- TF.js + MoveNet Lightning 설치, mediapipe ESM 이슈 해결
- 운동별 분석 모듈: `squat.js`, `deadlift.js`, `bench.js`
- 스켈레톤 오버레이, 피드백 패널, 운동 선택 UI
- GitHub 레포, Vercel 배포 완료
- 동영상 업로드 분석, 각도 콘솔 로그, TTS 경고 구현
- iPhone Safari 원격 디버깅으로 동작 확인

## 다음 세션 시작 시

- [ ] iPhone으로 운동 동영상 촬영 (전신 잡히게) → 맥미니 영상 업로드로 분석 테스트
- [ ] 분석 임계값 튜닝 (전신 동영상 보면서)
- [ ] USB 3.0 어댑터 도착 → RealSense 연결 확인 (`rs-enumerate-devices`)
- [ ] PWA manifest 추가 (모바일 홈화면 설치)

/**
 * [만능 팀 배정 알고리즘]
 * options: { useAbility: boolean, useGender: boolean, useAge: boolean }
 */
const distributeTeamsBalanced = (members, teamCount, options) => {
  const { useAbility, useGender, useAge } = options;

  // 1. 빈 팀 생성
  const teams = Array.from({ length: teamCount }, () => []);

  // ====================================================
  // [A] 정렬 전략 생성기 (Dynamic Sort Strategy)
  // 체크된 조건에 따라 정렬 우선순위를 결정함
  // ====================================================
  const getSortStrategy = (a, b) => {
    // 1순위: 능력치 (체크되었다면)
    if (useAbility && b.value !== a.value) {
      return b.value - a.value; // 높은 능력치 우선
    }
    // 2순위: 나이 (체크되었다면)
    if (useAge && b.age !== a.age) {
      // 능력치가 같다면(혹은 안 따진다면) 나이 많은 순
      return b.age - a.age; 
    }
    // 아무 조건도 없거나 동점이면: 무작위성 부여 (또는 등록순)
    return 0;
  };

  // ====================================================
  // [B] 줄 세우기 (Grouping & Sorting)
  // ====================================================
  let finalQueue = []; // 배정 대기열

  if (useGender) {
    // [조건: 성별 균형 O]
    // 남자와 여자를 따로 줄 세운 뒤, 지퍼처럼 하나씩 섞습니다.
    const males = members.filter((m) => m.sex === "남자").sort(getSortStrategy);
    const females = members.filter((m) => m.sex === "여자").sort(getSortStrategy);

    // 지퍼 병합 (Zipper Merge)
    const maxLength = Math.max(males.length, females.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < males.length) finalQueue.push(males[i]);
      if (i < females.length) finalQueue.push(females[i]);
    }
  } else {
    // [조건: 성별 균형 X]
    // 성별 상관없이 전체를 한 줄로 세웁니다.
    finalQueue = [...members].sort(getSortStrategy);
  }

  // ====================================================
  // [C] 스네이크 배정 (Snake Draft)
  // 준비된 긴 줄(finalQueue)을 앞에서부터 팀에 나눠줍니다.
  // ====================================================
  finalQueue.forEach((member, index) => {
    const round = Math.floor(index / teamCount);
    const isSnakeBack = round % 2 === 1;

    const teamIndex = isSnakeBack
      ? teamCount - 1 - (index % teamCount)
      : index % teamCount;

    teams[teamIndex].push(member);
  });

  return teams;
};

export default distributeTeamsBalanced;
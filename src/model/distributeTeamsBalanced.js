const distributeTeamsBalanced = (members, teamCount) => {
  // 1. 빈 팀 생성 (팀 개수만큼)
  // 예: [[], [], []] (3팀인 경우)
  const teams = Array.from({ length: teamCount }, () => []);

  // 2. 성별로 그룹 분리 (Divide)
  // 남자 그룹, 여자 그룹 따로 관리해야 성별 비율이 맞음
  const males = members.filter((m) => m.sex === "남자");
  const females = members.filter((m) => m.sex === "여자");

  // [핵심 함수] 정렬 로직 (능력치 우선, 그다음 나이)
  const sortStrategy = (a, b) => {
    // 1순위: 능력치 비교 (높은 사람이 앞으로)
    if (b.value !== a.value) {
      return b.value - a.value;
    }
    // 2순위: 능력치가 같다면 나이 비교 (많은 사람이 앞으로)
    // 이렇게 하면 '고능력+고연령'과 '고능력+저연령'이 골고루 섞임
    return b.age - a.age;
  };

  // 3. 각 그룹 줄 세우기 (Sort)
  males.sort(sortStrategy);
  females.sort(sortStrategy);

  // 4. 스네이크 배정 (Distribute)
  // targetList: 배정할 명단 (남자 먼저, 그 다음 여자... 순서는 상관없음)
  const distributeGroup = (group) => {
    group.forEach((member, index) => {
      // 스네이크 알고리즘의 핵심 인덱스 계산
      // 순방향: 0, 1, 2
      // 역방향: 2, 1, 0
      
      // 몇 번째 라운드인지 계산 (한 바퀴 돌았나?)
      const round = Math.floor(index / teamCount);
      
      // 짝수 라운드면 순방향 (0 -> End), 홀수 라운드면 역방향 (End -> 0)
      const isSnakeBack = round % 2 === 1;
      
      // 현재 멤버가 들어갈 팀 번호
      const teamIndex = isSnakeBack
        ? teamCount - 1 - (index % teamCount) // 뒤에서부터
        : index % teamCount;                  // 앞에서부터

      teams[teamIndex].push(member);
    });
  };

  // 남자 먼저 싹 배정하고
  distributeGroup(males);
  
  // 그 위에 여자들을 싹 배정함 (레이어 쌓기)
  // 팁: 여자는 역순으로 시작(reverse)해서 스네이크를 돌리면 밸런스가 더 잘 맞을 수 있음 (선택사항)

  distributeGroup(females);

  return teams;
}

// ==========================================
// [테스트 실행]
// ==========================================
// 더미 데이터 생성 (30명)
const dummyMembers = [];
for (let i = 0; i < 30; i++) {
  dummyMembers.push({
    name: `Member${i}`,
    sex: i < 12 ? "여자" : "남자", // 여자 12명, 남자 18명
    age: 20 + (i % 10), // 20~29세
    value: i % 5, // 능력치 0~4 골고루
  });
}

// 임시 결과
// [
//   { name: 'Member0', sex: '여자', age: 20, value: 0 },
//   { name: 'Member1', sex: '여자', age: 21, value: 1 },
//   { name: 'Member2', sex: '여자', age: 22, value: 2 },
//   { name: 'Member3', sex: '여자', age: 23, value: 3 },
//   { name: 'Member4', sex: '여자', age: 24, value: 4 },
//   { name: 'Member5', sex: '여자', age: 25, value: 0 },
//   { name: 'Member6', sex: '여자', age: 26, value: 1 },
//   { name: 'Member7', sex: '여자', age: 27, value: 2 },
//   { name: 'Member8', sex: '여자', age: 28, value: 3 },
//   { name: 'Member9', sex: '여자', age: 29, value: 4 },
//   { name: 'Member10', sex: '여자', age: 20, value: 0 },
//   { name: 'Member11', sex: '여자', age: 21, value: 1 },
//   { name: 'Member12', sex: '남자', age: 22, value: 2 },
//   { name: 'Member13', sex: '남자', age: 23, value: 3 },
//   { name: 'Member14', sex: '남자', age: 24, value: 4 },
//   { name: 'Member15', sex: '남자', age: 25, value: 0 },
//   { name: 'Member16', sex: '남자', age: 26, value: 1 },
//   { name: 'Member17', sex: '남자', age: 27, value: 2 },
//   { name: 'Member18', sex: '남자', age: 28, value: 3 },
//   { name: 'Member19', sex: '남자', age: 29, value: 4 },
//   { name: 'Member20', sex: '남자', age: 20, value: 0 },
//   { name: 'Member21', sex: '남자', age: 21, value: 1 },
//   { name: 'Member22', sex: '남자', age: 22, value: 2 },
//   { name: 'Member23', sex: '남자', age: 23, value: 3 },
//   { name: 'Member24', sex: '남자', age: 24, value: 4 },
//   { name: 'Member25', sex: '남자', age: 25, value: 0 },
//   { name: 'Member26', sex: '남자', age: 26, value: 1 },
//   { name: 'Member27', sex: '남자', age: 27, value: 2 },
//   { name: 'Member28', sex: '남자', age: 28, value: 3 },
//   { name: 'Member29', sex: '남자', age: 29, value: 4 }
// ]

// 멤버 데이터 출력
// console.log(dummyMembers)


// // 6개 팀으로 나누기
// const resultTeams = distributeTeamsBalanced(dummyMembers, 6);

// // 결과 확인 (콘솔)
// resultTeams.forEach((team, idx) => {
//   // 팀별 능력치 합계 계산
//   const totalAbility = team.reduce((sum, m) => sum + parseInt(m.value), 0);
//   const maleCount = team.filter((m) => m.sex === "남자").length;
//   const femaleCount = team.filter((m) => m.sex === "여자").length;
  

//   console.log(`[Team ${idx + 1}] 총원:${team.length}명, 능력합:${totalAbility}, 남:${maleCount}/여:${femaleCount}`);
// });

// distributeTeamsBalanced 함수 export
export default distributeTeamsBalanced
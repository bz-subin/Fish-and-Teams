/**
 * [함수: renderTeamResults]
 * 역할: 계산된 팀 배열(2차원 배열)을 예쁜 카드 형태로 화면에 뿌려줍니다.
 */
const renderTeamResults = (teams) => {
  const resultArea = document.getElementById("team-result-area");
  resultArea.innerHTML = ""; // 기존 결과 초기화

  // 팀의 성별 지정

  const teamSexRatio = {
    // 남자수
    male: 0,
    // 여자수
    female: 0,
  };

  // 각 팀을 순회하며 HTML 생성
  teams.forEach((team, index) => {
    // 팀별 통계 계산 (보너스)

    // 능력
    const totalAbility = team.reduce(
      (sum, m) => sum + parseInt(m.value || 0),
      0,
    );

    // 나이
    const totalAge = team.reduce((sum, m) => sum + parseInt(m.age || 0), 0);

    // 성별 비율 지정
    team.forEach((m) => {
      // 만약에 element에서
      // sex가 male이면
      if (m.sex === "남자") {
        teamSexRatio.male += 1;
      }
      // female이면
      else if (m.sex === "여자") {
        teamSexRatio.female += 1;
      }
      // 그 외에는 console로 띄움
      else {
        console.log(`남자 아니면 여자여야 합니다. ${m.sex}`);
      }
    });

    console.log(teamSexRatio);

    // 팀 능력 평균
    const avgAbility = (totalAbility / team.length).toFixed(1);
    // 팀 나이 평균
    const avgAge = (totalAge / team.length).toFixed(1);

    // 팀 카드 (DIV) 생성
    const teamCard = document.createElement("div");
    teamCard.className = "team-card";
    // 스타일은 CSS로 빼도 되지만, 편의상 여기에 적습니다.
    teamCard.style.border = "2px solid #333";
    teamCard.style.borderRadius = "8px";
    teamCard.style.padding = "15px";
    teamCard.style.minWidth = "200px";
    teamCard.style.backgroundColor = "#fff";
    teamCard.style.boxShadow = "3px 3px 5px rgba(0,0,0,0.1)";

    // 카드 내용 작성
    let memberListHTML = team
      .map(
        (m) => `
            <li style="margin-bottom: 4px;">
                <strong>${m.name}</strong> 
                <span style="font-size:0.8em; color:#666;">
                    (${m.age}세, ${m.sex}, ⭐${parseInt(m.value) + 1})
                </span>
            </li>
        `,
      )
      .join("");
// 남자 여자 성비 추가(텍스트 붙여보는 것은 재형님에게 추가로 물어보는 것으로)
    teamCard.innerHTML = `
            <h3 style="margin-top:0; border-bottom:1px solid #ddd; padding-bottom:5px;">
                Team ${index + 1}
            </h3>
            <div style="font-size: 0.9em; color: blue; margin-bottom: 10px;">
            👥 ${team.length} |  💪 ${avgAbility} | 🚻  남자 ${teamSexRatio.male} : 여자 ${teamSexRatio.female} |  🎂 ${avgAge}
            </div>
            <ul style="padding-left: 20px; margin: 0;">
                ${memberListHTML}
            </ul>

        `;

    resultArea.appendChild(teamCard);

    // 초기화화화
    teamSexRatio.female = 0;
      teamSexRatio.male = 0
  });

  // ----------------------------------------------------
  // [NEW] ★ 낚시 게임 자동 시작 연결! ★
  // index.html에 만들어둔 전역 함수(window.startFishingGame)를 호출합니다.
  // ----------------------------------------------------
  if (typeof window.startFishingGame === "function") {
    // 약간의 딜레이를 주어 사용자가 "배정 완료" 느낌을 받게 함
    setTimeout(() => {
        if(confirm("팀 배정이 완료되었습니다! 🎣 낚시 게임으로 결과를 확인하시겠습니까?")) {
            window.startFishingGame(teams);
        }
    }, 100);
  }

};

export default renderTeamResults;

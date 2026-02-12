/**
 * [함수: renderTeamResults]
 * 역할: 계산된 팀 배열(2차원 배열)을 예쁜 카드 형태로 화면에 뿌려줍니다.
 */
const renderTeamResults = (teams) => {
  const resultArea = document.getElementById("team-result-area");
  resultArea.innerHTML = ""; // 기존 결과 초기화

  // 각 팀을 순회하며 HTML 생성
  teams.forEach((team, index) => {
    // 팀별 통계 계산 (보너스)
    const totalAbility = team.reduce(
      (sum, m) => sum + parseInt(m.value || 0),
      0,
    );
    const avgAbility = (totalAbility / team.length).toFixed(1);

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

    teamCard.innerHTML = `
            <h3 style="margin-top:0; border-bottom:1px solid #ddd; padding-bottom:5px;">
                Team ${index + 1}
            </h3>
            <div style="font-size: 0.9em; color: blue; margin-bottom: 10px;">
                👥 ${team.length}명 | 💪 평균: ${avgAbility}
            </div>
            <ul style="padding-left: 20px; margin: 0;">
                ${memberListHTML}
            </ul>
        `;

    resultArea.appendChild(teamCard);
  });
}


export default renderTeamResults
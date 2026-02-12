/**
 * [목적]
 *   랜덤으로 팀을 배정하는 함수입니다.
 * 
 * [상세]
 *   - '팀 배정 밸런스' 체크박스가 해제되어 있을 때만 동작합니다.
 *   - '팀 수' 입력 필드에서 팀의 수를 가져옵니다.
 *   - localStorage의 'teamMembers' 데이터를 무작위로 섞습니다.
 *   - 팀 이름은 TeamA, TeamB, ... TeamZ, TeamAA, TeamAB, ... 순서로 생성합니다.
 *   - 생성할 수 있는 팀의 수를 초과하면 "팀수가 너무 많습니다"라는 알림을 표시합니다.
 *   - 최종적으로, 생성된 팀 구성(예: { TeamA: [...], TeamB: [...] })을
 *     'randomTeams'라는 키로 localStorage에 저장하고 콘솔에 출력합니다.
 * 
 * [참고]
 *   - 이 함수는 팀 수와 관련된 input 필드(id='team_Count')와 
 *     밸런스 체크박스(id='team_balance')가 HTML에 존재한다고 가정합니다.
 *   - localStorage의 'teamMembers' 키에는 [{ "name": "", "age": "", "sex": "", "job": "" }]
 *     형식의 데이터가 저장되어 있어야 합니다.
 */
function randomArrange() {
    // HTML에서 팀 수와 밸런스 체크박스 상태 가져오기
    const teamBalanceCheckbox = document.getElementById('team_balance');
    const teamCountInput = document.getElementById('team_Count');

    // HTML 요소가 존재하는지 확인
    if (!teamBalanceCheckbox || !teamCountInput) {
        console.error("필요한 HTML 요소 ('team_balance' 또는 'team_Count')를 찾을 수 없습니다.");
        alert("페이지 설정에 오류가 있습니다. 필요한 UI 요소를 찾을 수 없습니다.");
        return;
    }

    const isBalanceChecked = teamBalanceCheckbox.checked;
    const numberOfTeams = parseInt(teamCountInput.value, 10);

    // 밸런스 체크박스가 선택되지 않은 경우에만 무작위 배정 실행
    if (!isBalanceChecked) {
        // 유효성 검사
        if (isNaN(numberOfTeams) || numberOfTeams <= 0) {
            alert("팀 수를 올바르게 입력해주세요 (1 이상의 숫자).");
            return;
        }

        // localStorage에서 멤버 데이터 가져오기
        const members = JSON.parse(localStorage.getItem('teamMembers')) || [];

        if (members.length === 0) {
            alert("팀을 배정할 멤버가 없습니다. 먼저 멤버를 추가해주세요.");
            return;
        }

        // 팀 이름 생성
        const teamNames = generateTeamNames(numberOfTeams);
        if (!teamNames) {
            return; // generateTeamNames 내부에서 이미 알림을 보냄
        }

        // 멤버 리스트를 무작위로 섞기 (Fisher-Yates Shuffle)
        const shuffledMembers = [...members];
        for (let i = shuffledMembers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledMembers[i], shuffledMembers[j]] = [shuffledMembers[j], shuffledMembers[i]];
        }

        // 팀 객체 생성 및 멤버 배분
        const teams = {};
        teamNames.forEach(name => {
            teams[name] = [];
        });

        shuffledMembers.forEach((member, index) => {
            const teamIndex = index % numberOfTeams;
            teams[teamNames[teamIndex]].push(member);
        });

        // 결과를 localStorage에 저장하고 콘솔에 출력
        localStorage.setItem('randomTeams', JSON.stringify(teams));
        console.log("랜덤 팀 배정 결과:", teams);
        alert("랜덤 팀 배정이 완료되었습니다. 콘솔과 localStorage의 'randomTeams' 키를 확인하세요.");
    }
}

/**
 * [목적]
 *   지정된 수만큼의 팀 이름을 생성합니다.
 *   (예: TeamA, TeamB, ..., TeamZ, TeamAA, TeamAB, ...)
 * 
 * @param {number} count - 생성할 팀 이름의 수
 * @returns {string[]|null} 생성된 팀 이름 배열 또는 너무 많을 경우 null
 */
function generateTeamNames(count) {
    const names = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Single letter (A-Z)
    for (let i = 0; i < alphabet.length; i++) {
        if (names.length >= count) return names;
        names.push(`Team${alphabet[i]}`);
    }

    // Double letters (AA, AB, ...)
    for (let i = 0; i < alphabet.length; i++) {
        for (let j = 0; j < alphabet.length; j++) {
            if (names.length >= count) return names;
            names.push(`Team${alphabet[i]}${alphabet[j]}`);
        }
    }

    // 요청된 팀 수가 너무 많은 경우
    if (count > names.length) {
        alert("팀 수가 너무 많습니다. (최대 702개까지 가능)");
        return null;
    }

    return names;
}

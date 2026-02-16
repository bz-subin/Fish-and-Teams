/* 낚시 게임 엔진 및 데이터 관리 -> 엔진: 데이터를 넣으면 스스로 돌아가며 게임의 '규칙'과 '흐름'을 통제.*/
let gameData = { 
    teams: [], 
    currentSwiper: null, /*비어있는 상태(null). 값 추가 시 Swiper 라이브러리의 인스턴스 실행 가능.*/
    isFishing: false, /*낚시 애니메이션이 진행 중인가? 확인. true의 경우 이걸로 중복 실행 방어*/
    totalFished: 0, /*낚아올려진 팀원 수(실시간 변화)*/
    totalMembers: 0  /*전체 참여 인원(낚시 할 총 인원수)*/
};

/* 게임 시작 누르면 한 번만 실행됨_외부 호출 진입점 */
window.startFishingGame = function(calculatedTeams) {
    gameData.teams = calculatedTeams.map((members, idx) => ({
    teamName: `Team ${idx + 1}`,
    members: [...members]
    }));
    /*
    calculatedTeams : 분류가 끝난 팀원 명단  [김수빈 김빈수] [수김빈 빈수김]
        '받은 명단'을 members과 idx로 나눠서(배열> members : 팀원 다 / idx : 받은 명단 수 ) gameData.teams에 넣는다.
        teamName = 'members idx' 구조로 재조립. 'Team 1', 'Team 2' 이런식으로 (idx는 1부터 시작하게 +1)
        (... : 복제본 만드는것)_원본 보호

        gameData.teams는 (teamName : Team 1 , members: 김수빈 김빈수 )의 구조일것.
    */

    /*게임 시작 전 초기화*/
    gameData.totalMembers = calculatedTeams.flat().length; /*합치고(flat), 숫자 셈(length) ["김수빈","김빈수","수김빈","빈수김"] = 4*/ 
    gameData.totalFished = 0; 
    gameData.isFishing = false; /*위랑 중복(안정성) */

    renderGameScreens();
    /* 함수 실행 -> HTML(화면 요소)을 그려냄.*/


    document.getElementById('minigame-overlay').style.display = 'block'; /*숨겨둔 화면 보여줘.*/
    
    if (gameData.currentSwiper) gameData.currentSwiper.destroy(); 
    /*(gameData.currentSwiper): gameData.currentSwiper가 존재해?(참임?)
    참이면(이전 게임 슬라이더 기록이 있으면) 그거 삭제 할거임(destroy)*/
        gameData.currentSwiper = new Swiper(".mySwiper", { /*new : 인스턴스 생성 연산자. 불러온 swiper를 쓰기 위해 인스턴스 만듦*/
        allowTouchMove: false, /*터치로 넘어가게 안할거임*/
        loop: true, /*끝까지 가면 돌아오게 할거임*/
        observer: true,  /*내부 감시_html 내용이 바뀌면 즉시 새로고침해서 바뀐 내용 적용*/
        observeParents: true /*외부 감시_갑자기 없던게 생기면 슬라이더 크기 다시 계산*/
    });
};


/* 렌더링 */
function renderGameScreens() {
    const wrapper = document.getElementById('game-screens-wrapper');
    /*HTML에서 'game-screens-wrapper'라는 ID를 가진 박스를 찾아서 wrapper에 담아*/
    wrapper.innerHTML = gameData.teams.map((team, idx) => {
    /*gameData.teams는 (teamName : Team 1 , members: 김수빈 김빈수 )의 구조일것.*/
    /*이걸 팀 명, 팀 수로 나누겠다 이 말. (teamName : Team1, Team2 / idx: 0, 1)*/ 

        const styleIdx = idx % 3; /*팀 수에 어떤 숫자가 들어와도 0, 1, 2만 반복_이유: 어부가 3명뿐*/
        const imgNumber = styleIdx + 1; // 실제 이미지 파일 번호로 바꿈. fish_man(1,2,3)

        return `
        <div class="swiper-slide">
            <div class="game-screen">
                <div class="team-info">
                    <h2>${team.teamName}</h2>
                    <div class="record-box" id="record-${idx}">대기 중...</div>
                </div>
                <div class="wave-background"><div class="wave-canvas -one"></div></div>
                <div class="boat-container">                    
                    <div class="fisherman fish-style-${idx % 3}">
                        <img src="images/fish_man${imgNumber}.svg" alt="어부${imgNumber}">
                    </div>
                    <div class="boat"></div>
                    <div class="fishing-line line-style-${styleIdx}" id="line-${idx}">
                        <div class="float">🔴</div> 
                        <div class="fish">🐟</div>
                    </div>
                </div>
                <div class="wave-foreground">
                    <div class="wave-canvas -two"></div>
                    <div class="wave-canvas -three"></div>
                </div>
            </div>
        </div>`;
    }).join('');
}




/*
team-info : 큰 틀 
    ${team.teamName} : 팀명
    record-box : 점수판
wave-canvas -one : 파도1
boat-container : 배+어부+낚싯줄
fisherman (fish-style-${idx % 3}) : 어부(1~3)
images/fish_man${imgNumber}.svg" alt="어부${imgNumber} : 어부 이미지 경로, 
boat : 배
"fishing-line line-style-${styleIdx}" id="line-${idx}"> : 낚싯줄 세부조정
wave-canvas -two : 파도2
wave-canvas -three : 파도3

*/




/* [핵심 로직] 낚시 프로세스 (애니메이션 포함) */
function processFishing() {
    const currentSwiper = gameData.currentSwiper; /*가독성 개선*/
    /*(.많아서 헷갈림 gameData.currentSwiper.realIndex -> currentSwiper.realIndex)*/ 

    if (gameData.isFishing) return; /*낚시를 하고 있으면(true) 낚싯줄 다시 안 던지게 함(연타방지). */
    gameData.isFishing = true; /*true가 아니면 '지금 낚시중임(true)'으로 바꿈*/
    const idx = currentSwiper.realIndex; /* 현재 내 눈앞에 보이는 슬라이드 번호(0, 1, 2...) */
    const activeSlide = currentSwiper.slides[currentSwiper.activeIndex]; 
    /* 슬라이드 중 지금 내 화면에 떠 있는 '그 페이지' 통째로 가져오기 */

    /*지금 페이지에 있는 요소 가져오기*/
    const line = activeSlide.querySelector('.fishing-line'); /*낚싯줄*/
    const fish = activeSlide.querySelector('.fish'); /*물고기*/
    const float = activeSlide.querySelector('.float');  /*찌*/
    const record = activeSlide.querySelector('.record-box'); /*기록판*/

    /* 1. 찌 던지기 */
    line.style.height = "420px";

    setTimeout(() => {
        /* 2. 히트! 물고기 등장 및 낚아채기 */
        if (float) float.style.display = 'none'; 
        fish.style.display = 'block';
        line.style.height = "130px";

        setTimeout(() => {
            /* 3. 데이터 처리 및 기록 업데이트 */
            const team = gameData.teams[idx];
            if (team.members.length > 0) {
                const member = team.members.shift();
                if (record.innerHTML === "대기 중...") record.innerHTML = "";
                const item = document.createElement('div');
                item.innerHTML = `&nbsp;🎣 <b>${member.name}</b> 성공!`;
                record.prepend(item);
                gameData.totalFished++;
            }

            setTimeout(() => {
                /* 4. 초기화 및 즉시 화면 전환 */
                fish.style.display = 'none';
                if (float) float.style.display = 'block'; 
                line.style.height = "150px"; 

                // [수정] 화면 전환을 밖으로 빼서 즉시 실행 (속도 해결)
                if (gameData.totalFished >= gameData.totalMembers) {
                    document.getElementById('game-result-overlay').style.display = 'block';
                } else {
                    currentSwiper.slideNext();
                }

                // [수정] 방어막 해제만 0.6초 뒤에 실행 (드드득 방지)
                setTimeout(() => {
                    gameData.isFishing = false; 
                }, 600); 

            }, 800); // 3번 데이터 처리 후 대기 시간
        }, 700); // 2번 히트 후 대기 시간
    }, 800); // 1번 찌 던진 후 대기 시간
}
/* [이벤트] 스페이스바 입력 감지 */
window.addEventListener('keydown', (e) => {
    const isOverlayVisible = document.getElementById('minigame-overlay').style.display === 'block';
    if (e.code === 'Space' && isOverlayVisible && !gameData.isFishing) {
        e.preventDefault();
        processFishing();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // 페이지 스크롤 방지
        
        // 낚시 중이면 아예 함수를 실행하지 않고 리턴!
        if (gameData.isFishing) return; 
        
        processFishing();
    }
});







// /* [종료] 게임 닫기 */
// window.closeGameAndShowResult = function() {
//     document.getElementById('minigame-overlay').style.display = 'none';
//     document.getElementById('game-result-overlay').style.display = 'block';
//     alert("결과 화면을 확인하세요!");
//     location.reload();  /*버튼 클릭 시 새로고침 -> 새로 시작*/ 
// };
window.closeGameAndShowResult = function() {
    // 1. 결과 데이터를 한 줄로 만듭니다 (실제 변수명을 사용하세요)
    // 예시 데이터입니다. 실제 게임 로직에서 뽑힌 명단을 여기 넣으세요.
    let teamA = ["철수", "영희"];
    let teamB = ["길동", "명수"];

    let resultHTML = `
        <div style="margin-bottom: 10px;">
            <p><strong>[A팀]</strong></p>
            <p>${teamA.join(", ")}</p>
        </div>
        <div>
            <p><strong>[B팀]</strong></p>
            <p>${teamB.join(", ")}</p>
        </div>
    `;

    // 2. 아까 그 빈 칸(area)에 이 명단을 팍! 꽂아넣습니다.
    document.getElementById('team-result-area').innerHTML = resultHTML;

    // 3. 창들을 끄고 켭니다.
    document.getElementById('minigame-overlay').style.display = 'none';
    document.getElementById('game-result-overlay').style.display = 'block';

    // 4. 알림창 띄우기
    alert("결과 화면을 확인하세요!");
    location.reload(); 
};
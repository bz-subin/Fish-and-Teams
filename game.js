/* 낚시 게임 엔진 및 데이터 관리 */
let gameData = { 
    teams: [], 
    currentSwiper: null, 
    isFishing: false, 
    totalFished: 0, 
    totalMembers: 0 
};

/* [게임 시작] 외부 호출 진입점 */
window.startFishingGame = function(calculatedTeams) {
    gameData.teams = calculatedTeams.map((members, idx) => ({
        teamName: `Team ${idx + 1}`,
        members: [...members]
    }));
    
    gameData.totalMembers = calculatedTeams.flat().length;
    gameData.totalFished = 0;
    gameData.isFishing = false;

    renderGameScreens();
    
    document.getElementById('minigame-overlay').style.display = 'block';

    /* Swiper 초기화 (슬라이드 전환 금지) */
    if (gameData.currentSwiper) gameData.currentSwiper.destroy();
    gameData.currentSwiper = new Swiper(".mySwiper", {
        allowTouchMove: false,
        loop: true,
        observer: true,
        observeParents: true
    });
};

/* [렌더링] 팀별 낚시 화면 생성 */
function renderGameScreens() {
    const wrapper = document.getElementById('game-screens-wrapper');
    
    wrapper.innerHTML = gameData.teams.map((team, idx) => {
        // [자동화 핵심] 팀 수와 상관없이 0, 1, 2만 반복됨
        const styleIdx = idx % 3; 
        const imgNumber = styleIdx + 1; // 1, 2, 3번 이미지 파일 대응

        return `
        <div class="swiper-slide">
            <div class="game-screen">
                <div class="team-info">
                    <h2>${team.teamName}</h2>
                    <div class="record-box" id="record-${idx}">대기 중...</div>
                </div>
                <div class="wave-background"><div class="wave-canvas -three"></div></div>
                <div class="boat-container">                    
                    <div class="fisherman fish-style-${idx % 3}">
                        <img src="images/fish_man${imgNumber}.svg" alt="어부${imgNumber}">
                    </div>
                    <div class="boat"></div>
                    <div class="fishing-line line-style-${styleIdx}" id="line-${idx}">
                        <div class="fish">🐟</div>
                    </div>
                </div>
                <div class="wave-foreground">
                    <div class="wave-canvas -one"></div>
                    <div class="wave-canvas -two"></div>
                </div>
            </div>
        </div>`;
    }).join('');
}

/* [핵심 로직] 낚시 프로세스 (애니메이션 포함) */
function processFishing() {
    if (gameData.isFishing) return;
    gameData.isFishing = true;

    const idx = gameData.currentSwiper.realIndex;
    const activeSlide = gameData.currentSwiper.slides[gameData.currentSwiper.activeIndex];
    const line = activeSlide.querySelector(`.fishing-line`);
    const fish = activeSlide.querySelector(`.fish`);
    const record = document.getElementById(`record-${idx}`);

    /* 1. 찌 던지기 */
    line.style.height = "420px";

    setTimeout(() => {
        /* 2. 히트! 물고기 등장 및 낚아채기 */
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
                /* 4. 초기화 및 다음 팀 전환 */
                fish.style.display = 'none';
                line.style.height = "150px";
                gameData.isFishing = false;

                if (gameData.totalFished >= gameData.totalMembers) {
                    document.getElementById('game-result-overlay').style.display = 'block';
                } else {
                    gameData.currentSwiper.slideNext();
                }
            }, 800);
        }, 700);
    }, 800);
}

/* [이벤트] 스페이스바 입력 감지 */
window.addEventListener('keydown', (e) => {
    const isOverlayVisible = document.getElementById('minigame-overlay').style.display === 'block';
    if (e.code === 'Space' && isOverlayVisible && !gameData.isFishing) {
        e.preventDefault();
        processFishing();
    }
});

/* [종료] 게임 닫기 */
window.closeGameAndShowResult = function() {
    document.getElementById('minigame-overlay').style.display = 'none';
    document.getElementById('game-result-overlay').style.display = 'none';
    alert("결과 화면을 확인하세요!");
};
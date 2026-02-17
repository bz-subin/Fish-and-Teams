/* 게임 엔진 역할(중요한 것들 다 모아둠_이걸 기반으로 함수가 기능함)*/
let gameData = { 
    teams: [], 
    currentSwiper: null, /*비어있음. 화면 움직이는 기능 넣을 예정_slideNext(), slidePrev() 등*/
    isFishing: false, /*낚시 애니메이션 실행 중임? ㄴㄴ_중복 실행 방어*/
    totalFished: 0, /*낚아올려진 팀원 수*/
    totalMembers: 0  /*전체 참여 인원(낚시 할 총 인원)*/
};


/* window는 공용 공간과 같음. 어떤 파일에서도 사용 가능. 이름은 매번 다시 정해줘야함
1. 명단 받아서 조립
renderTeamResult.js - window.startFishingGame(teams);
=> teams라고 부르던 '팀 분배 끝난' 명단의 '알맹이'만을 startFishingGame으로 받아온 뒤 calculatedTeams라고 재정의.
받은 명단(calculatedTeams) : n 팀으로 나눠져서(분배 끝난 결과만) 들어옴.
명단에서 members(이름)와 idx만을 골라서(map), teamName, member의 구조로 조립해서 변수에 넣겠다.
before(map) -> members : ["김수빈", "김빈수"], ["수김빈", "빈수김"] / idx : 0, 1
after(재조립) -> team1 : ["김수빈", "김빈수"], team2 : ["수김빈", "빈수김"]
(... : 복제 /이름은(members) 팀 명단에서 바로 꺼내쓰는게 아니라 복제해서 조립)

2. 게임 시작 전 초기화
조립한 명단 합치고(flat), 숫자 셈(length) ["김수빈","김빈수","수김빈","빈수김"] = 4
낚아올려진 팀원 수
낚시 애니메이션 실행중 X(실행 가능)

3. 미니 게임 화면 제어 
renderGameScreens 함수 실행(none라서 숨겨져 있음. 안 보이는 상태)
display = 'block : 숨겨둔 화면 보여줘.

(currentSwiper : swiper 인스턴스)
4. 조건식 gameData.currentSwiper가 존재해?
참이면 그거 삭제 할거임(destroy) _기존 내용/새로 들어온 내용 충돌 방지

<currentSwiper(인스턴스)에 '인스턴스 설정' 넣기>
1. html 위치 확인, css 확인(.mySwiper_CSS 선택자)
    <div class="swiper mySwiper"> 하나의 요소에 두 개의 클래스를 한번에 준것.
2. 터치로 넘어가게 안할거임
3. 끝까지 가면 돌아오게 할거임
4. html 내용이 바뀌면 즉시 새로고침해서 바뀐 내용 적용(내부 감시)
5. 갑자기 없던게 생기면 슬라이더 크기 다시 계산(외부 감시) */

window.startFishingGame = function(calculatedTeams) {
    gameData.teams = calculatedTeams.map((members, idx) => ({
    teamName: `Team ${idx + 1}`,
    members: [...members]
    }));

    /*게임 시작 전 초기화*/
    gameData.totalMembers = calculatedTeams.flat().length;
    gameData.totalFished = 0; 
    gameData.isFishing = false;

    renderGameScreens();
    document.getElementById('minigame-overlay').style.display = 'block';
    
    if (gameData.currentSwiper) gameData.currentSwiper.destroy(); 
        gameData.currentSwiper = new Swiper(".mySwiper", { /*new : 인스턴스 생성 연산자. 불러온 swiper를 쓰기 위해 인스턴스 만듦*/
        allowTouchMove: false,
        loop: true,
        observer: true, 
        observeParents: true
    });
};


/* 렌더링: HTML 뼈대부터 슬라이드까지 한 번에 생성 */
function renderGameScreens() {
    // 1. 가장 바깥쪽 큰 그릇을 찾습니다.
    const overlay = document.getElementById('minigame-overlay');
    
    // 2. [추가된 부분] 게임의 전체적인 레이아웃(Swiper 껍데기 + 결과창)을 먼저 그립니다.
    // 기존 HTML 파일에 있던 복잡한 태그들을 이 백틱(``) 안으로 옮겨온 거예요.
    overlay.innerHTML = `
        <div class="swiper mySwiper">
            <div class="swiper-wrapper" id="game-screens-wrapper"></div>
        </div>

        <div id="game-result-overlay" style="display: none;">
            <h3>🎣 만선 완료!</h3>
            <div id="team-result-area"></div>
            <button type="button" class="game-over-btn" onclick="closeGame()">결과창 보기</button>
            <button type="button" class="kakao-share-btn" onclick="shareToKakao()">
                <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="카톡" width="18">
                카톡 공유
            </button>
        </div>
    `;

    // 3. [기존 로직] 이제 방금 만든 'game-screens-wrapper'를 찾아서 팀별 슬라이드를 채웁니다.
    const wrapper = document.getElementById('game-screens-wrapper');
    wrapper.innerHTML = gameData.teams.map((team, idx) => {
        const styleIdx = idx % 3;
        const imgNumber = styleIdx + 1;

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
                    <div class="bg-plus"></div>
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
    /*(.많아서 헷갈림 gameData 생략)*/ 
    const idx = currentSwiper.realIndex; /* 현재 내 눈앞에 보이는 슬라이드 번호(0, 1, 2...) */
    const activeSlide = currentSwiper.slides[currentSwiper.activeIndex]; 
    /* '슬라이드가 모두 담긴 배열'에서 내가 보고 있는 화면을 통째로 가져올거야. */

    /*지금 페이지에 있는 요소 가져오기*/
    const line = activeSlide.querySelector('.fishing-line'); /*낚싯줄*/
    const fish = activeSlide.querySelector('.fish'); /*물고기*/
    const float = activeSlide.querySelector('.float');  /*찌*/
    const record = activeSlide.querySelector('.record-box'); /*기록판*/

    line.style.height = "420px"; /*낚싯줄이 길어짐!*/
    setTimeout(() => { /*0.8초 기다림_물고기가 바로 잡혀올라오면 너무 빠름*/
        if (float) float.style.display = 'none';  /*있던 찌를 없앰.*/
        fish.style.display = 'block'; /*물고기 보이게 바꾸고*/
        line.style.height = "130px"; /*낚싯줄 줄어듬_잡힌 물고기가 올라오는듯 보이게*/

        setTimeout(() => {  /*0.7초 기다림*/
            const team = gameData.teams[idx]; /*지금 낚시한 팀이 몇번째 팀이였지?*/
            if (team.members.length > 0) {  /*이 팀에 아직 낚시 안 한 멤버가 남아있나?*/
                const member = team.members.shift();  
                /*shift : 명단 맨 앞 사람 이름을 '쏙 뽑아냄'. 낚시로 뽑힌 사람(짜고치는) 이름 지우는것*/
                if (record.innerHTML === "대기 중...") record.innerHTML = ""; /*innerHTML이 대기중임? 그럼 공백으로 바꿔!*/
                /*파이썬 ==이 자바스크립트에서는 ===임!!*/
                const item = document.createElement('div'); /*공백을 채울 새 영역 만듦*/
                item.innerHTML = `&nbsp;🎣 <b>${member.name}</b> 성공!`; /*새로 만든 영역 안에 성공이라 씀*/
                record.prepend(item);  /*html 기록판(record) 영역의 '맨 윗줄(prepend)'에 딱 붙임_record는 js에 있음*/
                gameData.totalFished++; /*몇마리 잡았는지 카운트 올림*/
            }

            setTimeout(() => { /*0.8초 대기*/
                /* 4. 초기화 및 즉시 화면 전환 */
                fish.style.display = 'none'; /*물고기 없앰*/
                if (float) float.style.display = 'block'; /*만약 찌가 보인다면*/
                line.style.height = "150px"; /*낚싯줄 150으로 함.*/

                // [수정] 화면 전환을 밖으로 빼서 즉시 실행 (속도 해결)
                if (gameData.totalFished >= gameData.totalMembers) { /*물고기 다 잡음?*/
                    document.getElementById('game-result-overlay').style.display = 'block'; /*게임오버창 뜨게 하겠다.*/
                } else { /*물고기 덜 잡음?*/
                    currentSwiper.slideNext(); /*다음 슬라이드로 넘겨라.*/
                }

                // [수정] 방어막 해제만 0.6초 뒤에 실행 (드드득 방지)
                setTimeout(() => { /*0.6초 대기*/
                    gameData.isFishing = false; /*낚시 대기중임 언제든지 시작해도 됨!*/
                }, 600); 

            }, 800); // 3번 데이터 처리 후 대기 시간
        }, 700); // 2번 히트 후 대기 시간
    }, 800); // 1번 찌 던진 후 대기 시간
}

/*[이벤트]*/
window.addEventListener('keydown', (e) => {  
    /*키보드 입력 감지 고. e를 입력받아서 함수 실행.*/
    if (e.code !== 'Space') return;  /*스페이스바 누르면 반환(바로 끝내버리기~)*/
    e.preventDefault();   /* 스페이스바 기본 기능(스크롤) 막기 */
    const gameisopen = document.getElementById('minigame-overlay').style.display === 'block';
    /*html에서 미니게임 오버레이가 보이는 상태임??*/
    /*gameisopen에 true, false로 입력받음 */
    if (gameisopen && !gameData.isFishing) {
        /*&&둘 다 참임?(게임 열려있음? 낚시 안하는거 맞음?*/
        // [방어막] 여기서 딱 한 번만 문을 잠그기! 
        gameData.isFishing = true;  /*(연타 방지)*/
        processFishing(); //낚시 고!
    }
});


/*[종료]*/
window.closeGame = function() { 
    let caughtList = gameData.finalMembers || ["아직 아무도 못 잡음"];
    /*쌓인 데이터가 있으면 가져오고 ||(없으면) 아직 아무도 못 잡음 써라.*/

    let resultHTML = `
        <div style="text-align: center;">
            <h3>🎣 만선 완료! 🎣</h3>
            <p><strong>이번에 낚인 명단:</strong></p>
            <p>${caughtList.join(", ")}</p> 
        </div>
    `;
    /*결과창에 뿌릴 내용*/

    document.getElementById('team-result-area').innerHTML = resultHTML;
    /*team-result-area 안쪽 html 내용과 resultHTML을 바꾸겠다.*/

    // 4. 화면 전환 (게임판 끄고, 결과창 켜고)
    document.getElementById('minigame-overlay').style.display = 'none'; /*미니게임 끔*/
    document.getElementById('game-result-overlay').style.display = 'block'; /*결과창 나와라잉*/

    alert("결과 화면을 확인하세요!");
    location.reload(); /*브라우저 새로고침 버튼(F5)을 코드로 누르는 것*/
};
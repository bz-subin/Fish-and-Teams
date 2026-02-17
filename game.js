/* 게임 엔진 역할(중요한 것들 다 모아둠_이걸 기반으로 함수가 기능함)*/
let gameData = { 
    teams: [], 
    currentSwiper: null, /*비어있음. 화면 움직이는 기능 넣을 예정_slideNext(), slidePrev() 등*/
    isFishing: false, /*낚시 애니메이션 실행 중임? ㄴㄴ_중복 실행 방어*/
    totalFished: 0, /*낚아올려진 팀원 수*/
    totalMembers: 0  /*전체 참여 인원(낚시 할 총 인원)*/
};


/* ------------------------------------------------------------------
window는 공용 공간과 같음. 어떤 파일에서도 사용 가능. 이름은 매번 다시 정해줘야함
renderTeamResult.js - window.startFishingGame(teams);
=> teams라고 부르던 '팀 분배 끝난' 명단의 '알맹이'만을 startFishingGame으로 받아온 뒤 calculatedTeams라고 재정의.
받은 명단(calculatedTeams) : n 팀으로 나눠져서(분배 끝난 결과만) 들어옴.


1-1. 명단을 받는다
(두 팀으로 분류 되었다면) calculatedTeams은 이런 구조일것.

[
[{name: "김수빈", age: 10, gender: "여", note: ★★★★★},
{name: "김빈수", age: 20, gender: "남", note: ★★★}],

[{name: "수김빈", age: 30, gender: "여", note: ★},
{name: "빈수김", age: 40, gender: "남", note: ★★★★}]
]

------------------------------------------------------------------
1-2. 받은 명단에서 한 팀씩 꺼내서 members라는 이름과 순서를 붙임(map)
calculatedTeams.map((members, idx) -> 

idx : 0
members :[
[{name: "김수빈", age: 10, gender: "여", note: ★★★★★},
{name: "김빈수", age: 20, gender: "남", note: ★★★}]
]

idx : 1
members :[
[{name: "수김빈", age: 30, gender: "여", note: ★},
{name: "빈수김", age: 40, gender: "남", note: ★★★★}]
]
------------------------------------------------------------------
1-3. 조립한다.(members는 복제하여 사용)
gameData.teams(조립) -> 

[   {"teamName": "Team 1",
    "members": 
        [{ "name": "김수빈", "age": 10, "gender": "여", "note": "★★★★★" },
        { "name": "김빈수", "age": 20, "gender": "남", "note": "★★★" }]
    },
    
    {"teamName": "Team 2",
    "members": 
        [{ "name": "수김빈", "age": 30, "gender": "여", "note": "★" },
        { "name": "빈수김", "age": 40, "gender": "남", "note": "★★★★" }]
    }
]
------------------------------------------------------------------
2. 게임 시작 전 초기화
받은 명단의 인원을 합쳐서(flat) 한 팀으로 만들고, 몇명인지 셈(length) - 전체 인원수가 나올것 
낚아올려진 팀원 수
낚시 애니메이션 실행중 X(실행 가능)

3. 미니 게임 화면 제어 
renderGameScreens 함수 실행(none라서 숨겨져 있음. 안 보이는 상태)
display = 'block : 숨겨둔 화면 보여줘.

(currentSwiper : swiper 인스턴스)
4. 조건식 gameData.currentSwiper가 존재해?
참이면 그거 삭제 할거임(destroy) _기존 내용/새로 들어온 내용 충돌 방지

new Swiper에 인스턴스를 만들거야. 
myswiper(CSS 선택자)의 html 위치에 css요소를 반영하고, 인스턴스 설정을 넣어서.
만든 new Swiper 인스턴스를 currentSwiper에 넣을게.

'인스턴스 설정'
    1. 터치로 넘어가게 안할거임
    2. 끝까지 가면 돌아오게 할거임
    3. html 내용이 바뀌면 즉시 새로고침해서 바뀐 내용 적용(내부 감시)
    4. 갑자기 없던게 생기면 슬라이더 크기 다시 계산(외부 감시) */

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
    
    if (gameData.currentSwiper) gameData.currentSwiper.destroy(); 
        gameData.currentSwiper = new Swiper(".mySwiper", { 
        allowTouchMove: false,
        loop: true,
        observer: true, 
        observeParents: true
    });
};


/* 렌더링
html에서 minigame-overlay 부분(html) 찾아서 overlay에 담기.
overlay에 html 추가
    swiper 'mySwiper'(액자)랑 game-screens-wrapper(뒤에 있는 그림) 놓을 영역 만들게!
    게임 종료 시 뜰 결과창(+버튼 두 개) 숨겨둠
    
    html에서 game-screens-wrapper 부분(html) 찾아서 wrapper에 담기.
------------------------------------------------------------------
wrapper.innerHTML = gameData.teams.map((team, idx) -> 
'innerHTML'이 있어서 gameData.teams를 html로 변환 

<div class="team" data-team-id="0">
    <h3>Team 1</h3>
    <ul>
        <li>김수빈 (10세, 여), 평가: ★★★★★</li>
        <li>김빈수 (20세, 남), 평가: ★★★</li>
    </ul>
</div>
<div class="team" data-team-id="1">
    <h3>Team 2</h3>
    <ul>
        <li>수김빈 (30세, 여), 평가: ★</li>
        <li>빈수김 (40세, 남), 평가: ★★★★</li>
    </ul>
</div>
------------------------------------------------------------------
0~2 (화면 idx)
1~3 (어부 이미지 경로)

슬라이더로 넘길 화면 배치
team-info 
    팀명
    대기중(record-box)
파도1
배 (배치, 정렬)
어부 (배치, 정렬)
어부 이미지
배
낚싯줄
찌
물고기
파도2
파도3
배경 꾸밈요소

=>  map는 안에 든걸 하나씩 꺼내는것을 반복함. 당연히 매번 return도 거침.
팀 수에 따라 만들어지는 모든 화면을 하나씩 확인하고 배열(임시 보관소)에 담아둠.
화면이 다 나오면 배열에서 꺼내 join으로 옆으로 길게 붙임(swiper로 움직일 수 있게)*/



function renderGameScreens() {
    const overlay = document.getElementById('minigame-overlay');
    overlay.innerHTML = `
        <div class="swiper mySwiper">
            <div class="swiper-wrapper" id="game-screens-wrapper"></div> 
        </div>

        <div id="game-result-overlay" style="display: none;">
            <h3>🎣 만선 완료!</h3>
            <button type="button" class="game-over-btn" onclick="closeGame()">결과창 보기</button>
            <div id="team-result-area"></div>
            <button type="button" class="kakao-share-btn" onclick="shareToKakao()">
                <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" alt="카톡" width="18">
                카톡 공유
            </button>
        </div>
    `;

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
                    <div class="wave-canvas -two"></div>
                    <div class="wave-canvas -three"></div>
                    <div class="bg-plus"></div>
            </div>
        </div>`;
    }).join('');
}


/*가독성 개선(gameData.currentSwiper -> currentSwiper)
현재 내 눈앞에 보이는 슬라이드 번호(0, 1, 2...)_몇번째 화면인지 확인.
'join으로 이은 화면들' 중에서 내가 조작할(낚시) 화면을 정할거야. */

/*지금 페이지에 있는 요소 가져오기

/*낚싯줄이 길어짐!
0.8초 대기 -> 물고기가 바로 잡혀올라오면 너무 빠름
    있던 찌를 없앰.
    물고기 보이게 바꾸고
    낚싯줄 줄어듬_잡힌 물고기가 올라오는듯 보이게*/

/*0.7초 대기
    지금 낚시한 팀이 몇번째 팀이였지?
    이 팀에 아직 낚시 안 한 멤버가 남아있나?
    shift : 명단 맨 앞 사람 이름을 '쏙 뽑아냄'. 낚시로 뽑힌 사람(짜고치는) 이름 지우는것
    innerHTML이 대기중이라 써있음? 그럼 공백으로 바꿔!
    공백을 채울 새 영역 만듦
    새로 만든 영역 안에 성공이라 씀
    html 기록판(record) 영역의 '맨 윗줄(prepend)'에 딱 붙임
    몇마리 잡았는지 카운트 올림*/


/*0.8초 대기
    물고기 없앰
    만약 찌가 보인다면
    낚싯줄 150으로 함_ 낚았을때보다 길어지게
물고기 다 잡음?
    게임오버창 뜨게 하겠다.
물고기 덜 잡음?
    다음 슬라이드로 넘겨라(더 잡게)*/

/*0.6초 대기
    낚시 대기중임 언제든지 시작해도 됨!*/



/* 이벤트 발생 시 낚시 */
function processFishing() {
    const currentSwiper = gameData.currentSwiper; 
    const idx = currentSwiper.realIndex; 
    const activeSlide = currentSwiper.slides[currentSwiper.activeIndex]; 


    /*지금 페이지에 있는 요소 가져오기*/
    const line = activeSlide.querySelector('.fishing-line');
    const fish = activeSlide.querySelector('.fish');
    const float = activeSlide.querySelector('.float');
    const record = activeSlide.querySelector('.record-box');

    line.style.height = "420px"; 
    setTimeout(() => { /*0.8초 대기*/
        if (float) float.style.display = 'none';  
        fish.style.display = 'block'; 
        line.style.height = "130px"; 

        setTimeout(() => {  /*0.7초 기다림*/
            const team = gameData.teams[idx]; 
            if (team.members.length > 0) {  
                const member = team.members.shift();  
                if (record.innerHTML === "대기 중...") record.innerHTML = "";
                const item = document.createElement('div'); 
                item.innerHTML = `&nbsp;🎣 <b>${member.name}</b> 성공!`;
                record.prepend(item);  
                gameData.totalFished++; 
            }

            setTimeout(() => { /*0.8초 대기*/
                fish.style.display = 'none'; 
                if (float) float.style.display = 'block'; 
                line.style.height = "150px"; 
                if (gameData.totalFished >= gameData.totalMembers) { 
                    document.getElementById('game-result-overlay').style.display = 'block';
                } else { 
                    currentSwiper.slideNext();
                }

                setTimeout(() => { /*0.6초 대기*/
                    gameData.isFishing = false;
                }, 600); 

            }, 800); 
        }, 700);
    }, 800); 
}

/*[이벤트]*/
window.addEventListener('keydown', (e) => { /*키보드 입력 감지 고. e를 입력받아서 함수 실행.*/
    if (e.code !== 'Space') return;  /*스페이스바 누르면 반환(바로 끝내버리기~)*/
    e.preventDefault();   /* 스페이스바 기본 기능(스크롤) 막기 */
    const gameisopen = document.getElementById('minigame-overlay').style.display === 'block';
    /*html에서 미니게임 오버레이가 보이는 상태임??(게임 열려있음?)*/
    if (gameisopen && !gameData.isFishing) {
        /*&&둘 다 참임?(게임 열려있음? 낚시 할 수 있는 상태 맞음?(false)*/
        gameData.isFishing = true;  /*낚시중인 상태*/
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

    /*화면 전환 (게임판 끄고, 결과창 켜고)*/
    document.getElementById('minigame-overlay').style.display = 'none'; /*미니게임 끔*/
    document.getElementById('game-result-overlay').style.display = 'block'; /*결과창 나와라잉*/

    alert("결과 화면을 확인하세요!");
    location.reload(); /*브라우저 새로고침 버튼(F5)을 코드로 누르는 것*/
};



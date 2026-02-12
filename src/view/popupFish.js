// 스페이스 바를 클릭하게 되면
// 팝업이 뜨는 로직
const popupFish = () => {
  // 50% 상수화
  const HALF = "50%";

  // 우선 body 가져오기
  const body = document.querySelector("body");

  // body에 팝업 요소 넣기
  const popupFishElement = document.createElement("div");

  // 팝업 스타일 지정
  const popupFishElementStyle = (e) => {
    // 팝업 크기 지정
    // 가로 600px, 세로 400px
    e.style.width = "600px";
    e.style.height = "400px";

    // 색깔 지정
    e.style.backgroundColor = "#fff";

    // 테두리 둥글기 지정
    e.style.borderRadius = "10px";

    // 테두리 지정
    e.style.border = "3px solid #222";

    // 포지션 fixed
    e.style.position = "fixed";

    // 중앙 정렬
    e.style.left = HALF;
    e.style.top = HALF;
    e.style.transform = `translate(-${HALF},-30%)`;
    e.style.transition = "all 0.5s";
  };

  //  스타일 실행
  popupFishElementStyle(popupFishElement);

  // body에 팝업 넣기
  body.appendChild(popupFishElement);

  // 애니메이션이 등장하도록 함

  const spawnFish = (e) => {
    // 움직이는 시간 지정
    // 위치 지정
    e.style.transform = `translate(-${HALF},-${HALF})`;

    // 1초 뒤에 사라짐
    setTimeout(()=>{

        e.style.transform = `translate(-${HALF},-70%)`;
        e.style.opacity = "0%"
        setTimeout(()=>{

            popupFishElement.remove()

        },500)

    },1000)

  };
  //   다음 프레임에 이펙트 연출
  requestAnimationFrame(() => spawnFish(popupFishElement))
};

// 출력
export default popupFish;

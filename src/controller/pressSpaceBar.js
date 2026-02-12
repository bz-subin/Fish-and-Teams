// popupFish.js 가져옴
import popupFish from "../view/popupFish.js";


// 스페이스 바 클릭시 이벤트 동작
const pressSpaceBar = () => {

    // 키 입력 이벤트
    document.addEventListener("keypress",(e)=>{

        // 만약에 누른 키가 스페이스 바일때
        if(e.code === "Space"){

            popupFish()

        }

    })

}

// 출력
export default pressSpaceBar
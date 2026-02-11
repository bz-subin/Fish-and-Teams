// ===========================================================
// 1. LocalStorage 폴리필 (Polyfill)
// ===========================================================
// 브라우저에 localStorage 기능이 없거나 차단된 경우를 대비한 안전장치입니다.
// 만약 localStorage가 없다면, 메모리 상에 임시 객체(store)를 만들어
// 마치 localStorage가 있는 것처럼 흉내 냅니다.
if (typeof localStorage === "undefined") {
  // 데이터를 저장할 임시 저장소
  let store = {};

  // localStorage의 핵심 기능들을 가짜로 구현
  let localStorageMock = {
    getItem: function (key) {
      return store[key] || null; // 키로 값 가져오기
    },
    setItem: function (key, value) {
      store[key] = value.toString(); // 키와 값을 문자열로 저장
    },
    removeItem: function (key) {
      delete store[key]; // 해당 키 삭제
    },
    clear: function () {
      store = {}; // 저장소 초기화
    },
  };

  // window 객체에 가짜 localStorage를 정의하여 에러 방지
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
}

// ===========================================================
// 2. 메인 화면 렌더링 함수 (Read)
// ===========================================================
/**
 * [함수: mainFrm]
 * 역할: localStorage에 저장된 멤버 데이터를 불러와서, HTML 테이블로 화면에 그려줍니다.
 * 실행 시점: 페이지 로드 시, 멤버 추가/수정/삭제 후 화면 갱신 시
 */
function mainFrm() {
  try {
    // 1. 데이터 가져오기
    // localStorage는 문자열만 저장하므로 JSON.parse로 객체 배열로 변환합니다.
    // 데이터가 없으면 빈 배열([])을 사용합니다.
    let members = JSON.parse(localStorage.getItem("teamMembers")) || [];

    // [헬퍼 함수] 숫자(0~4)를 별(⭐️) 문자열로 바꿔주는 함수
    // 예: 0 -> ⭐️, 2 -> ⭐️⭐️⭐️
    const valueToStars = (value) => {
      const numValue = parseInt(value, 10);
      // 유효하지 않은 값이면 빈 문자열 반환
      if (isNaN(numValue) || numValue < 0 || numValue > 4) {
        return "";
      }
      return "⭐️".repeat(numValue + 1);
    };

    // 2. 테이블 행(TR) 생성하기 (map 함수 사용)
    // 멤버 배열을 순회하면서 HTML 문자열로 변환합니다.
    let tableRows = members
      .map((member, index) => {
        // 각 행마다 체크박스, 이름, 나이, 성별, 별점을 출력
        // data-index="${index}"를 심어놓는 이유: 나중에 수정/삭제할 때 몇 번째 멤버인지 알기 위함
        return `
                <tr style="border: 1px solid black;">
                    <td style="border: 1px solid black; padding: 5px; text-align: center;">
                        <input type="checkbox" name="memberCheckbox" data-index="${index}">
                    </td>
                    <td style="border: 1px solid black; padding: 5px;">${member.name}</td>
                    <td style="border: 1px solid black; padding: 5px;">${member.age}</td>
                    <td style="border: 1px solid black; padding: 5px;">${member.sex}</td>
                    <td style="border: 1px solid black; padding: 5px;">${valueToStars(member.value)}</td>
                </tr>
            `;
      })
      .join(""); // 배열을 하나의 문자열로 합침

    // 3. 화면(DOM)에 그리기
    const app = document.getElementById("app");
    app.innerHTML = `
            <table style="border-collapse: collapse; width: 100%; border: 2px solid black;">
                <thead>
                    <tr style="border: 2px solid black;">
                        <th style="border: 1px solid black; padding: 5px; width: 50px;">
                            <input type="checkbox" onclick="sumCheckbox(this)">
                        </th>
                        <th style="border: 1px solid black; padding: 5px;">이름</th>
                        <th style="border: 1px solid black; padding: 5px;">나이</th>
                        <th style="border: 1px solid black; padding: 5px;">성별</th>
                        <th style="border: 1px solid black; padding: 5px;">능력</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows} </tbody>
            </table>
            <br>
            <button onclick="addMember()">추가</button>
            <button onclick="modifyMember()">수정</button>
            <button onclick="delMember()">삭제</button>
        `;
  } catch (error) {
    //   error가 발생하면
    // Error rendering main form: 라는 문구와 함께 력러 출력
    console.error("Error rendering main form:", error);
  }
}

/**
 * [함수: sumCheckbox]
 * 역할: 헤더의 체크박스를 누르면, 아래 모든 멤버의 체크박스를 켜거나 끕니다.
 */
function sumCheckbox(masterCheckbox) {
  const checkboxes = document.getElementsByName("memberCheckbox");
  for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = masterCheckbox.checked;
  }
}

// ===========================================================
// 3. 멤버 추가 기능 (Create)
// ===========================================================
/**
 * [함수: addMember]
 * 역할: 새 창(팝업)을 열어서 정보를 입력받고 저장합니다.
 */
function addMember() {
  // 1. 빈 팝업창 열기 (400x400 크기)
  const addWindow = window.open("", "_blank", "width=400,height=400");

  // 2. 팝업창 안에 HTML 내용 채워넣기 (동적 생성)
  addWindow.document.write(`
        <html>
        <head>
            <title>멤버 추가</title>
            <script>
                // [내부 함수] 팝업창에서 '추가' 버튼 누르면 실행됨
                function submitAdd() {
                    // 입력값 가져오기
                    const name = document.getElementById('name').value;
                    const age = document.getElementById('age').value;
                    const sex = document.querySelector('input[name="sex"]:checked');
                    const value = document.getElementById('ability').value;

                    // 유효성 검사: 빈 값이 있으면 경고
                    if (!name || !age || !sex || value === "") {
                        alert('모든 값을 입력하거나 선택해주세요.');
                        return;
                    }
                    // 유효성 검사: 나이는 숫자여야 하고 3자리 이하
                    if (isNaN(age) || age.length > 3) {
                        alert('나이는 3자리 이하의 숫자로 입력해주세요.');
                        return;
                    }

                    // 저장할 객체 생성
                    const newMember = { name, age, sex: sex.value, value };

                    // ★ 핵심: 부모창(window.opener)의 localStorage에 접근
                    // 1. 부모창의 데이터를 가져와서 배열로 변환
                    let members = JSON.parse(window.opener.localStorage.getItem('teamMembers')) || [];
                    // 2. 새 멤버 추가
                    members.push(newMember);
                    // 3. 다시 문자열로 바꿔서 저장
                    window.opener.localStorage.setItem('teamMembers', JSON.stringify(members));
                    // 4. 부모창의 화면을 새로고침 (mainFrm 실행)
                    window.opener.mainFrm();
                    // 5. 팝업창 닫기
                    window.close();
                }
            </script>
        </head>
        <body>
            <h2>멤버 추가</h2>
            <p>이름: <input type="text" id="name"></p>
            <p>나이: <input type="text" id="age" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3)"></p>
            <p>성별: 
                <input type="radio" name="sex" value="남자"> 남자
                <input type="radio" name="sex" value="여자"> 여자
            </p>
            <p>능력: 
                <select id="ability">
                    <option value="" disabled selected>선택하십시오</option>
                    <option value="0">⭐️</option>
                    <option value="1">⭐️⭐️</option>
                    <option value="2">⭐️⭐️⭐️</option>
                    <option value="3">⭐️⭐️⭐️⭐️</option>
                    <option value="4">⭐️⭐️⭐️⭐️⭐️</option>
                </select>
            </p>
            <button onclick="submitAdd()">추가</button>
        </body>
        </html>
    `);
}

// ===========================================================
// 4. 멤버 수정 기능 (Update)
// ===========================================================
/**
 * [함수: modifyMember]
 * 역할: 선택된 멤버의 기존 정보를 팝업창에 띄우고, 수정된 내용을 저장합니다.
 */
function modifyMember() {
  // 1. 체크된 박스들만 가져오기
  const checkedBoxes = document.querySelectorAll(
    'input[type="checkbox"][name="memberCheckbox"]:checked',
  );

  // 유효성 검사: 아무것도 선택 안 했거나, 2개 이상 선택했을 때
  if (checkedBoxes.length === 0) {
    alert("수정할 내용을 선택하십시오.");
    return;
  }
  if (checkedBoxes.length > 1) {
    alert("하나의 항목만 선택하여 주십시오.");
    return;
  }

  // 2. 수정할 대상 데이터 찾기
  // 체크박스에 심어둔 data-index 속성으로 몇 번째 멤버인지 확인
  const index = checkedBoxes[0].getAttribute("data-index");
  let members = JSON.parse(localStorage.getItem("teamMembers")) || [];
  const memberToModify = members[index];

  if (!memberToModify) {
    alert("선택한 멤버 정보를 찾을 수 없습니다.");
    return;
  }

  // 3. 셀렉트 박스(별점) 옵션 미리 만들기
  // 기존 값과 일치하는 옵션에 'selected' 속성을 추가함
  let options = "";
  for (let i = 0; i < 5; i++) {
    const stars = "⭐️".repeat(i + 1);
    // 현재 멤버의 점수(value)와 i가 같으면 선택된 상태로 표시
    const selected = i == memberToModify.value ? "selected" : "";
    options += `<option value="${i}" ${selected}>${stars}</option>`;
  }

  // 4. 수정 팝업창 열기
  const modifyWindow = window.open("", "_blank", "width=400,height=400");
  modifyWindow.document.write(`
        <html>
        <head>
            <title>멤버 수정</title>
            <script>
                function submitModify() {
                    // (추가 함수와 로직 동일) 값 가져오기 및 유효성 검사
                    const name = document.getElementById('name').value;
                    const age = document.getElementById('age').value;
                    const sex = document.querySelector('input[name="sex"]:checked');
                    const value = document.getElementById('ability').value;

                    if (!name || !age || !sex || value === "") {
                        alert('모든 값을 입력하거나 선택해주세요.');
                        return;
                    }
                     if (isNaN(age) || age.length > 3) {
                        alert('나이는 3자리 이하의 숫자로 입력해주세요.');
                        return;
                    }

                    // 수정된 객체 생성
                    const modifiedMember = { name, age, sex: sex.value, value };

                    // 부모창 데이터 가져오기
                    let members = JSON.parse(window.opener.localStorage.getItem('teamMembers')) || [];
                    
                    // ★ 핵심: push가 아니라 해당 인덱스(index)의 값을 덮어쓰기
                    // 여기서 ${index}는 템플릿 리터럴을 통해 부모창에서 넘겨준 숫자값임
                    members[${index}] = modifiedMember;

                    // 저장 및 갱신
                    window.opener.localStorage.setItem('teamMembers', JSON.stringify(members));
                    window.opener.mainFrm();
                    window.opener.close();
                }
            <\/script>
        </head>
        <body>
            <h2>멤버 수정</h2>
            <p>이름: <input type="text" id="name" value="${memberToModify.name}"></p>
            <p>나이: <input type="text" id="age" value="${memberToModify.age}" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3)"></p>
            <p>성별: 
                <input type="radio" name="sex" value="남자" ${memberToModify.sex === "남자" ? "checked" : ""}> 남자
                <input type="radio" name="sex" value="여자" ${memberToModify.sex === "여자" ? "checked" : ""}> 여자
            </p>
            <p>능력: 
                <select id="ability">
                    <option value="" disabled>선택하십시오</option>
                    ${options} </select>
            </p>
            <button onclick="submitModify()">수정</button>
        </body>
        </html>
    `);
}

// ===========================================================
// 5. 멤버 삭제 기능 (Delete)
// ===========================================================
/**
 * [함수: delMember]
 * 역할: 체크된 멤버들을 배열에서 제거하고 저장합니다.
 */
function delMember() {
  // 1. 체크된 박스 모두 가져오기
  const checkedBoxes = document.querySelectorAll(
    'input[type="checkbox"]:checked',
  );

  if (checkedBoxes.length === 0) {
    alert("삭제할 내용을 선택하십시오.");
    return;
  }

  // 2. 삭제할 인덱스들 수집
  let members = JSON.parse(localStorage.getItem("teamMembers")) || [];
  // map을 통해 체크박스 요소들을 숫자(인덱스) 배열로 변환
  const indicesToDelete = Array.from(checkedBoxes).map((cb) =>
    parseInt(cb.getAttribute("data-index"), 10),
  );

  // 3. ★ 중요: 내림차순 정렬 (큰 숫자부터 삭제)
  // 이유: 앞(0번)을 지우면 뒤(1번)가 0번으로 당겨짐.
  // 인덱스가 꼬이는 것을 방지하기 위해 뒤에서부터 지워야 함.
  indicesToDelete.sort((a, b) => b - a);

  // 4. 배열에서 삭제 (splice)
  for (const index of indicesToDelete) {
    members.splice(index, 1); // 해당 인덱스부터 1개 삭제
  }

  // 5. 저장 및 화면 갱신
  localStorage.setItem("teamMembers", JSON.stringify(members));
  mainFrm(); // 여기서는 팝업이 아니므로 window.opener 없이 바로 호출
}

// ===========================================================
// 6. 초기 실행 (Initialization)
// ===========================================================
function startcurd() {
  // 페이지의 모든 리소스(이미지 등)가 로드된 후 실행
  window.onload = function () {
    // 만약 처음 실행해서 데이터가 아예 없다면, 빈 배열로 초기화
    if (!localStorage.getItem("teamMembers")) {
      const initialMembers = [];
      localStorage.setItem("teamMembers", JSON.stringify(initialMembers));
    }
    // 초기 화면 그리기
    mainFrm();
  };
}

// 앱 시작
startcurd();

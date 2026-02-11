if (typeof localStorage === 'undefined') {
    let localStorageMock = (function() {
        let store = {};
        return {
            getItem: function(key) {
                return store[key] || null;
            },
            setItem: function(key, value) {
                store[key] = value.toString();
            },
            removeItem: function(key) {
                delete store[key];
            },
            clear: function() {
                store = {};
            }
        };
    })();
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
    });
}


/**
 * [목적] 기본 틀을 만들고 localStorage의 데이터를 렌더링합니다.
 */
function mainFrm() {
    try {
        let members = JSON.parse(localStorage.getItem('teamMembers')) || [];

        // Helper function to convert value to stars
        const valueToStars = (value) => {
            const numValue = parseInt(value, 10);
            if (isNaN(numValue) || numValue < 0 || numValue > 4) {
                return '';
            }
            return '⭐️'.repeat(numValue + 1);
        };

        let tableRows = members.map((member, index) => {
            return `
                <tr style="border: 1px solid black;">
                    <td style="border: 1px solid black; padding: 5px; text-align: center;"><input type="checkbox" name="memberCheckbox" data-index="${index}"></td>
                    <td style="border: 1px solid black; padding: 5px;">${member.name}</td>
                    <td style="border: 1px solid black; padding: 5px;">${member.age}</td>
                    <td style="border: 1px solid black; padding: 5px;">${member.sex}</td>
                    <td style="border: 1px solid black; padding: 5px;">${valueToStars(member.value)}</td>
                </tr>
            `;
        }).join('');

        const app = document.getElementById('app');
        app.innerHTML = `
            <table style="border-collapse: collapse; width: 100%; border: 2px solid black;">
                <thead>
                    <tr style="border: 2px solid black;">
                        <th style="border: 1px solid black; padding: 5px; width: 50px;"><input type="checkbox" onclick="sumCheckbox(this)"></th>
                        <th style="border: 1px solid black; padding: 5px;">이름</th>
                        <th style="border: 1px solid black; padding: 5px;">나이</th>
                        <th style="border: 1px solid black; padding: 5px;">성별</th>
                        <th style="border: 1px solid black; padding: 5px;">능력</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <br>
            <button onclick="addMember()">추가</button>
            <button onclick="modifyMember()">수정</button>
            <button onclick="delMember()">삭제</button>
        `;

    } catch (error) {
        console.error("Error rendering main form:", error);
    }
}

function sumCheckbox(masterCheckbox) {
    const checkboxes = document.getElementsByName('memberCheckbox');
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = masterCheckbox.checked;
    }
}

/**
 * [목적] '추가' 버튼을 누르면 멤버를 추가하는 새 창을 엽니다.
 */
function addMember() {
    const addWindow = window.open('', '_blank', 'width=400,height=400');
    addWindow.document.write(`
        <html>
        <head>
            <title>멤버 추가</title>
            <script>
                function submitAdd() {
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

                    const newMember = { name, age, sex: sex.value, value };

                    let members = JSON.parse(window.opener.localStorage.getItem('teamMembers')) || [];
                    members.push(newMember);
                    window.opener.localStorage.setItem('teamMembers', JSON.stringify(members));
                    window.opener.mainFrm();
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

/**
 * [목적] 선택된 멤버의 정보를 수정하는 새 창을 엽니다.
 */
function modifyMember() {
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"][name="memberCheckbox"]:checked');

    if (checkedBoxes.length === 0) {
        alert("수정할 내용을 선택하십시오.");
        return;
    }

    if (checkedBoxes.length > 1) {
        alert("하나의 항목만 선택하여 주십시오.");
        return;
    }

    const index = checkedBoxes[0].getAttribute('data-index');
    let members = JSON.parse(localStorage.getItem('teamMembers')) || [];
    const memberToModify = members[index];

    if (!memberToModify) {
        alert("선택한 멤버 정보를 찾을 수 없습니다.");
        return;
    }

    // Create options for the select dropdown
    let options = '';
    for (let i = 0; i < 5; i++) {
        const stars = '⭐️'.repeat(i + 1);
        const selected = i == memberToModify.value ? 'selected' : '';
        options += `<option value="${i}" ${selected}>${stars}</option>`;
    }

    const modifyWindow = window.open('', '_blank', 'width=400,height=400');
    modifyWindow.document.write(`
        <html>
        <head>
            <title>멤버 수정</title>
            <script>
                function submitModify() {
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

                    const modifiedMember = { name, age, sex: sex.value, value };

                    let members = JSON.parse(window.opener.localStorage.getItem('teamMembers')) || [];
                    members[${index}] = modifiedMember;
                    window.opener.localStorage.setItem('teamMembers', JSON.stringify(members));
                    window.opener.mainFrm();
                    window.close();
                }
            <\/script>
        </head>
        <body>
            <h2>멤버 수정</h2>
            <p>이름: <input type="text" id="name" value="${memberToModify.name}"></p>
            <p>나이: <input type="text" id="age" value="${memberToModify.age}" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3)"></p>
            <p>성별: 
                <input type="radio" name="sex" value="남자" ${memberToModify.sex === '남자' ? 'checked' : ''}> 남자
                <input type="radio" name="sex" value="여자" ${memberToModify.sex === '여자' ? 'checked' : ''}> 여자
            </p>
            <p>능력: 
                <select id="ability">
                    <option value="" disabled>선택하십시오</option>
                    ${options}
                </select>
            </p>
            <button onclick="submitModify()">수정</button>
        </body>
        </html>
    `);
}

/**
 * [목적] 선택된 멤버들을 삭제합니다.
 */
function delMember() {
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');

    if (checkedBoxes.length === 0) {
        alert("삭제할 내용을 선택하십시오.");
        return;
    }

    let members = JSON.parse(localStorage.getItem('teamMembers')) || [];
    const indicesToDelete = Array.from(checkedBoxes).map(cb => parseInt(cb.getAttribute('data-index'), 10));

    // Sort indices in descending order to avoid issues with splicing
    indicesToDelete.sort((a, b) => b - a);

    for (const index of indicesToDelete) {
        members.splice(index, 1);
    }

    localStorage.setItem('teamMembers', JSON.stringify(members));
    mainFrm(); // Refresh the view
}

function startcurd() {
    // 웹 페이지에 필요한 모든 자원이 다 로드될 때까지 기다리는 함수
    // localStorage.getItem('teamMemvers")의 내용이 없다면
    
    window.onload = function() {

                if (!localStorage.getItem('teamMembers')) {
                    const initialMembers = [
                    ];
                    localStorage.setItem('teamMembers', JSON.stringify(initialMembers));
                }
                mainFrm();
            };
        }


// 실행
startcurd()
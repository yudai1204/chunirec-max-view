const gasURL = "https://script.googleusercontent.com/macros/echo?user_content_key=z56gINUOQ4kr08O1I0GiPODUw1y6eE0nlVFGvhwNRZbRWCCHH9Y5Eio2d2WtdrkJ3MFlv8qgTauIWKjwkDN_Kd1eVgrDVNMrm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnHnz09H7Wp_9rxUKoUTVpQr_sh334iHtI2U-QWr4hlOl6o6EqHumpDGhUt7sYBLJRLaxXD8OLi8pxH5QVADYWNquFyQqNDI5Ltz9Jw9Md8uu&lib=MUrCf38X_1N59t_RajvHzLnjpVClwzP4k";

window.addEventListener('load', function () {
    fetch(gasURL, { cache: "no-cache" })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success:', data);
            const table = document.getElementById("sort_table");
            for (const d of data) {
                table.insertAdjacentHTML("beforeEnd",
                    `<tr id="${d.id + "-" + d.difficulty}">
                    <td>${((d.difficulty === "m") ? '<span style="color:#7800af">' : '<span style="color:#800">') + d.title}</span></td>
                    <td class="const">${d.const}</td>
                    <td>${d.genre}</td>
                    <td>${d.MAXcount}</td>
                    <td>${Math.round(10000 * d.MAXcount / d.parameter) / 100}</td>
                    <td>${Math.round(10000 * d.MAXcount / d.AJcount) / 100}</td>
                </tr>`);
            }
            displayMyData();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert("読み込みに失敗しました");
            document.getElementById("loading").innerHTML = "ERROR";
        });

    

    document.getElementById("submit").addEventListener("click", function () {
        const lvmin = Number(document.getElementById("lvmin").value);
        const lvmax = Number(document.getElementById("lvmax").value);
        const doRemoveMax = document.getElementById("removeMyMax").checked;
        for(const score of document.querySelectorAll(".scores")){
            if(score.innerHTML == "1010000" && doRemoveMax){
                if (!score.parentNode.classList.contains("hide2")) score.parentNode.classList.add("hide2");
            }else{
                if (score.parentNode.classList.contains("hide2")) score.parentNode.classList.remove("hide2");
            }
        }
        for (const c of document.querySelectorAll(".const")) {
            if (Number(c.innerHTML) < lvmin || Number(c.innerHTML) > lvmax) {
                if (!c.parentNode.classList.contains("hide")) c.parentNode.classList.add("hide");
            } else {
                if (c.parentNode.classList.contains("hide")) c.parentNode.classList.remove("hide");
            }
        }
        alert("絞り込み完了");
    });
    document.getElementById("clearFilter").addEventListener("click", function () {
        for (const dom of document.querySelectorAll(".hide")) {
            dom.classList.remove("hide");
        }
        for (const dom of document.querySelectorAll(".hide2")) {
            dom.classList.remove("hide2");
        }
    })
    document.getElementById("displayScore").addEventListener("click", function () {
        location.href=("index.html?username="+document.getElementById("username").value)
    })
});


function displayMyData() {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    if (params.get('username')) {
        const chunirecName = params.get('username');
        document.getElementById("username").value = chunirecName;
        if (chunirecName !== "") {
            const userURL = "https://api.chunirec.net/2.0/records/showall.json?region=jp2&token=c8bae3934e20bc8e1f22cc549cd625859e14f317fef3c6f11596483672fc7b5dc9ba837b08a63754165479c4ce12edb9652bb6d83a119505f6c6ac87d4c9a33d&user_name=" + chunirecName;
            fetch(userURL, { cache: "no-cache" })
                .then((response) => response.json())
                .then((data) => {
                    console.log('Success:', data);
                    document.getElementById("thead").insertAdjacentHTML("beforeEnd", `<th>SCORE:${chunirecName}</th>`)
                    for (const music of data.records) {
                        if (music.diff !== "MAS" && music.diff !== "ULT") continue;
                        const row = document.getElementById(music.id + "-" + ((music.diff === "MAS") ? "m" : "u"));
                        row.insertAdjacentHTML("beforeEnd", `<td class="scores">${music.score}</td>`);
                        
                    }
                    document.getElementById("loading").style.display = "none";
                    document.getElementById("filter").style.display = "block";
                    document.getElementById("myscorefilter").style.display = "block";
                    document.getElementById("sort_table").style.display = "block";
                    sortTable();
                })
                .catch((error) => {
                    console.error('Error:', error);
                    if (error.code == 403) {
                        alert("読み込みに失敗しました。\nアカウントが非公開設定になっている可能性があります。");
                    } else {
                        alert("読み込みに失敗しました。\nアカウントが存在しません。");
                    }
                    location.href = "index.html"
                });
        }
    }else{
        document.getElementById("loading").style.display = "none";
        document.getElementById("filter").style.display = "block";
        document.getElementById("myscorefilter").style.display = "block";
        document.getElementById("sort_table").style.display = "block";
        sortTable();
    }
}

function sortTable() {
    let column_no = 0; //今回クリックされた列番号
    let column_no_prev = 0; //前回クリックされた列番号
    document.querySelectorAll('#sort_table th').forEach(elm => {
        elm.onclick = function () {
            column_no = this.cellIndex; //クリックされた列番号
            let table = this.parentNode.parentNode.parentNode;
            let sortType = 0; //0:数値 1:文字
            let sortArray = new Array; //クリックした列のデータを全て格納する配列
            for (let r = 1; r < table.rows.length; r++) {
                //行番号と値を配列に格納
                let column = new Object;
                column.row = table.rows[r];
                column.value = table.rows[r].cells[column_no].textContent;
                sortArray.push(column);
                //数値判定
                if (isNaN(Number(column.value))) {
                    sortType = 1; //値が数値変換できなかった場合は文字列ソート
                }
            }
            if (sortType == 0) { //数値ソート
                if (column_no_prev == column_no) { //同じ列が2回クリックされた場合は降順ソート
                    sortArray.sort(compareNumberDesc);
                } else {
                    sortArray.sort(compareNumber);
                }
            } else { //文字列ソート
                if (column_no_prev == column_no) { //同じ列が2回クリックされた場合は降順ソート
                    sortArray.sort(compareStringDesc);
                } else {
                    sortArray.sort(compareString);
                }
            }
            //ソート後のTRオブジェクトを順番にtbodyへ追加（移動）
            let tbody = this.parentNode.parentNode;
            for (let i = 0; i < sortArray.length; i++) {
                tbody.appendChild(sortArray[i].row);
            }
            //昇順／降順ソート切り替えのために列番号を保存
            if (column_no_prev == column_no) {
                column_no_prev = -1; //降順ソート
            } else {
                column_no_prev = column_no;
            }
        };
    });
}
//数値ソート（昇順）
function compareNumber(a, b) {
    return a.value - b.value;
}
//数値ソート（降順）
function compareNumberDesc(a, b) {
    return b.value - a.value;
}
//文字列ソート（昇順）
function compareString(a, b) {
    if (a.value < b.value) {
        return -1;
    } else {
        return 1;
    }
    return 0;
}
//文字列ソート（降順）
function compareStringDesc(a, b) {
    if (a.value > b.value) {
        return -1;
    } else {
        return 1;
    }
    return 0;
}
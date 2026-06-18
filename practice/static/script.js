const mapContainer = document.querySelector(".map-container");
const map = document.getElementById("map");

const saveBtn = document.getElementById("saveBtn");
const loadFile = document.getElementById("loadFile");

let buildings = [];

const EDIT_MODE = false;

//////////////////////////////////////////////////
// 建物作成
//////////////////////////////////////////////////

function createBuilding(name, x, y) {


const button = document.createElement("button");

button.className = "building";
button.textContent = name;

button.style.left = x + "px";
button.style.top = y + "px";

mapContainer.appendChild(button);

const building = {
    shortName: name,
    x: x,
    y: y,
    element: button
};

buildings.push(building);

//////////////////////////////////////////////////
// ボタンクリックで情報表示
//////////////////////////////////////////////////

button.addEventListener("click", function (e) {

    e.stopPropagation();

    const info = BUILDING_INFO[building.shortName];

    if (!info) {

        document.getElementById("building-name")
            .textContent = building.shortName;

        document.getElementById("building-description")
            .textContent = "情報未登録";

        document.getElementById("building-photo")
            .src = "/static/noimage.png";

        return;
    }

    document.getElementById("building-name")
        .textContent = info.fullName;

    document.getElementById("building-description")
        .textContent = info.description;

    document.getElementById("building-photo")
        .src = "/static/" + info.photo;
});

//////////////////////////////////////////////////
// 編集モード時のみ
//////////////////////////////////////////////////

if (EDIT_MODE) {

    makeDraggable(building);

    button.addEventListener("contextmenu", function (e) {

        e.preventDefault();

        if (confirm(name + " を削除しますか？")) {

            button.remove();

            buildings = buildings.filter(
                b => b !== building
            );
        }
    });
}


}

//////////////////////////////////////////////////
// ドラッグ移動
//////////////////////////////////////////////////

function makeDraggable(building) {


let dragging = false;

const btn = building.element;

btn.addEventListener("mousedown", function () {

    dragging = true;
});

document.addEventListener("mouseup", function () {

    dragging = false;
});

document.addEventListener("mousemove", function (e) {

    if (!dragging) return;

    const rect =
        mapContainer.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    btn.style.left = x + "px";
    btn.style.top = y + "px";

    building.x = Math.round(x);
    building.y = Math.round(y);
});

}

//////////////////////////////////////////////////
// 建物追加（編集モードのみ）
//////////////////////////////////////////////////

if (EDIT_MODE) {


map.addEventListener("click", function (e) {

    const name = prompt("建物名を入力");

    if (!name) return;

    createBuilding(
        name,
        e.offsetX,
        e.offsetY
    );
});


}

//////////////////////////////////////////////////
// JSON保存
//////////////////////////////////////////////////

saveBtn.addEventListener("click", function () {


const data = buildings.map(b => ({
    name: b.shortName,
    x: b.x,
    y: b.y
}));

const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
);

const url = URL.createObjectURL(blob);

const a = document.createElement("a");

a.href = url;
a.download = "buildings.json";

a.click();

URL.revokeObjectURL(url);


});

//////////////////////////////////////////////////
// JSON読込
//////////////////////////////////////////////////

loadFile.addEventListener("change", function () {


const file = this.files[0];

if (!file) return;

const reader = new FileReader();

reader.onload = function () {

    const data = JSON.parse(reader.result);

    document
        .querySelectorAll(".building")
        .forEach(e => e.remove());

    buildings = [];

    data.forEach(item => {

        createBuilding(
            item.name,
            item.x,
            item.y
        );
    });
};

reader.readAsText(file);


});

//////////////////////////////////////////////////
// 起動時自動読込
//////////////////////////////////////////////////

fetch("/static/buildings.json")
.then(response => response.json())
.then(data => {

    data.forEach(item => {

        createBuilding(
            item.name,
            item.x,
            item.y
        );
    });
})
.catch(error => {

    console.log("buildings.jsonが見つかりません");

});

const mapContainer = document.querySelector(".map-container");
const map = document.getElementById("map");

const photo =
    document.getElementById("building-photo");

const prevBtn =
    document.getElementById("prev-photo");

const nextBtn =
    document.getElementById("next-photo");

let currentPhotos = [];
let currentIndex = 0;

const saveBtn = document.getElementById("saveBtn");
const loadFile = document.getElementById("loadFile");

const popupOverlay =
    document.getElementById("popup-overlay");

const closePopup =
    document.getElementById("close-popup");

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
            .src = "";

        popupOverlay.style.display = "flex";

        return;
    }

    document.getElementById("building-name")
        .textContent = info.fullName;

    document.getElementById("building-description")
        .textContent = info.description;

    if (info.photos) {

    currentPhotos = info.photos;

} else {

    currentPhotos = [info.photo];

}

currentIndex = 0;

photo.src =
    "/static/" + currentPhotos[currentIndex];

    popupOverlay.style.display = "flex";
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

    updateSearchList();
})
.catch(error => {

    console.log("buildings.jsonが見つかりません");

});

//////////////////////////////////////////////////
// ポップアップを閉じる
//////////////////////////////////////////////////

closePopup.addEventListener("click", function () {

    popupOverlay.style.display = "none";

});

popupOverlay.addEventListener("click", function (e) {

    if (e.target === popupOverlay) {

        popupOverlay.style.display = "none";
    }
});

function updateSearchList() {

    const datalist =
        document.getElementById("buildingList");

    datalist.innerHTML = "";

    Object.keys(BUILDING_INFO).forEach(code => {

        const option =
            document.createElement("option");

        const name =
            BUILDING_INFO[code].fullName;

        option.value =
            code + " (" + name + ")";

        datalist.appendChild(option);
    });
}

const searchInput =
    document.getElementById("searchInput");

searchInput.addEventListener("keydown", function(e){

    if(e.key !== "Enter") return;

    let keyword =
        this.value.trim();

    keyword =
        keyword.split(" ")[0];

    keyword =
        keyword.split("(")[0];

    const building =
        buildings.find(
            b => b.shortName === keyword
        );

    if(!building){

        alert("見つかりません");
        return;
    }

    building.element.click();
});

prevBtn.addEventListener("click", function(e){

    e.stopPropagation();

    currentIndex--;

    if(currentIndex < 0){

        currentIndex =
            currentPhotos.length - 1;

    }

    photo.src =
        "/static/" + currentPhotos[currentIndex];

});

nextBtn.addEventListener("click", function(e){

    e.stopPropagation();

    currentIndex++;

    if(currentIndex >= currentPhotos.length){

        currentIndex = 0;

    }

    photo.src =
        "/static/" + currentPhotos[currentIndex];

});

// =========================
// GPSで現在地取得
// =========================

const userMarker = document.getElementById("userLocation");

function updateUserLocation() {

    if (!navigator.geolocation) {
        alert("このブラウザでは位置情報が利用できません。");
        return;
    }

    navigator.geolocation.watchPosition(
        function(position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log("現在地:", lat, lng);

            // ここは仮の位置（あとで本物に変える）
            const x = 500;
            const y = 400;

            userMarker.style.left = x + "px";
            userMarker.style.top = y + "px";
            userMarker.style.display = "block";

        },
        function(error) {
            alert("位置情報を取得できませんでした。");
        },
        {
            enableHighAccuracy: true
        }
    );
}

updateUserLocation();

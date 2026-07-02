function createBuilding(name, x, y) {

    // 元の地図画像サイズ
    const BASE_WIDTH = 1000;
    const BASE_HEIGHT = 1200;

    const button = document.createElement("button");

    button.className = "building";
    button.textContent = name;

    function updatePosition() {

        const rect = map.getBoundingClientRect();

        const scaleX = rect.width / BASE_WIDTH;
        const scaleY = rect.height / BASE_HEIGHT;

        button.style.left = (x * scaleX) + "px";
        button.style.top = (y * scaleY) + "px";
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);

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

        document.getElementById("building-photo")
            .src = "/static/" + info.photo;

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

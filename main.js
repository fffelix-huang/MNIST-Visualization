let WIDTH = 24;

let image = []; // 24 * 24

let mousePressed = 0;

document.body.onmousedown = () => {
    mousePressed = 1;
};

document.body.onmouseup = () => {
    mousePressed = 0;
};

const grid = document.getElementById("grid");

const initGrid = () => {
    grid.innerHTML = "";
    image = [];
    for(let i = 0; i < WIDTH; i++) {
        image.push([]);
        const row = document.createElement("div");
        row.classList.add("row");
        for(let j = 0; j < WIDTH; j++) {
            image[i].push(0);
            const pixel = document.createElement("button");
            pixel.classList.add("pixel");
            pixel.onmouseover = () => {
                if(mousePressed) {
                    if(image[i][j] == 0) {
                        image[i][j] = 1;
                        pixel.classList.add("filled");
                    }
                }
            }
            row.appendChild(pixel);
        }
        grid.appendChild(row);
    }
};

window.onload = () => {
    initGrid();
};

const clearButton = document.getElementById("clear-button");

clearButton.onclick = () => {
    initGrid();
}

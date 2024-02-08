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

const bars = document.getElementById("bars");
let probability = [];

const initBars = () => {
    bars.innerHTML = "";
    probability = [];
    for(let i = 0; i < 10; i++) {
        probability.push(0);
        const label = document.createElement("label");
        label.textContent = i;
        const bar = document.createElement("progress");
        bar.value = 0;
        bar.max = 100;
        label.appendChild(bar);
        bars.appendChild(label);
    }
};

window.onload = () => {
    initGrid();
    initBars();
};

const clearButton = document.getElementById("clear-button");

clearButton.onclick = window.onload;

const updateProbability = () => {
    for(let i = 0; i < bars.children.length; i++) {
        const label = bars.children[i];
        const bar = label.children[0];
        bar.value = probability[i] * 100;
    }
};

const FPS = 60;

setInterval(updateProbability, 1000 / FPS);
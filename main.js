let WIDTH = 28;

let image = []; // 28 * 28

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

// MNIST model data
let weights = [];
let biases = [];

const initWeights = () => {
    weights = [];
    biases = [];
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "assets/mnist_weights.txt", true);
    xhr.onload = () => {
        if(xhr.status >= 200 && xhr.status < 300) {
            // Request success
            let text = xhr.responseText.split(" ");
            let data = [];
            text.forEach((e) => {
                data.push(parseFloat(e));
            });
            let index = 0;
            {
                // Read first layer
                // 784 * 256 + 256
                let weight = [];
                let bias = [];
                for(let i = 0; i < 784; i++) {
                    let w = [];
                    for(let j = 0; j < 256; j++) {
                        w.push(data[index++]);
                    }
                    weight.push(w);
                }
                for(let i = 0; i < 256; i++) {
                    bias.push(data[index++]);
                }
                weights.push(weight);
                biases.push(bias);
            }
            {
                // Read second layer
                // 256 * 10 + 10
                let weight = [];
                let bias = [];
                for(let i = 0; i < 256; i++) {
                    let w = [];
                    for(let j = 0; j < 10; j++) {
                        w.push(data[index++]);
                    }
                    weight.push(w);
                }
                for(let i = 0; i < 10; i++) {
                    bias.push(data[index++]);
                }
                weights.push(weight);
                biases.push(bias);
            }
        } else {
            alert("Cannot load mnist_weights.txt.");
        }
    };
    xhr.send();
};

window.onload = () => {
    initGrid();
    initBars();
    initWeights();
};

const clearButton = document.getElementById("clear-button");

clearButton.onclick = () => {
    initGrid();
    initBars();
};

const updateProbability = () => {
    {
        // Calculate Neural Network
        // Structure: Input (28*28=784) -> 256 (relu) -> 10 (softmax)

        // First Layer
        let result = Array.from(biases[0]);
        for(let x = 0; x < WIDTH; x++) {
            for(let y = 0; y < WIDTH; y++) {
                let i = x * WIDTH + y;
                for(let j = 0; j < 256; j++) {
                    result[j] += image[x][y] * weights[0][i][j];
                }
            }
        }
        // Activation: relu
        let input = [];
        for(let i = 0; i < 256; i++) {
            input.push(Math.max(result[i], 0));
        }

        // Second Layer
        result = Array.from(biases[1]);
        for(let i = 0; i < 256; i++) {
            for(let j = 0; j < 10; j++) {
                result[j] += input[i] * weights[1][i][j];
            }
        }
        // Activation: softmax
        let exp = [];
        let exp_sum = 0;
        for(let i = 0; i < 10; i++) {
            exp.push(Math.exp(result[i]));
            exp_sum += exp[i];
        }
        for(let i = 0; i < 10; i++) {
            result[i] = exp[i] / exp_sum;
        }
        probability = result;
        // console.log(probability);
    }
    for(let i = 0; i < bars.children.length; i++) {
        const label = bars.children[i];
        const bar = label.children[0];
        bar.value = probability[i] * 100;
    }
};

const FPS = 60;
setInterval(updateProbability, 1000 / FPS);
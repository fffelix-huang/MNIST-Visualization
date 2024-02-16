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
let conv_weight = [];
let conv_bias = [];
let linear_weight = [];
let linear_bias = [];

const initWeights = () => {
    conv_weight = [];
    conv_bias = [];
    linear_weight = [];
    linear_bias = [];
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
            const readConv2dLayer = (in_channels, out_channels, kernel_size) => {
                let filters = [];
                for(let o = 0; o < out_channels; o++) {
                    let filter = [];
                    for(let i = 0; i < in_channels; i++) {
                        let kernel = [];
                        for(let x = 0; x < kernel_size; x++) {
                            let row = [];
                            for(let y = 0; y < kernel_size; y++) {
                                row.push(data[index++]);
                            }
                            kernel.push(row);
                        }
                        filter.push(kernel);
                    }
                    filters.push(filter);
                }
                conv_weight.push(filters);
                let bias = [];
                for(let i = 0; i < out_channels; i++) {
                    bias.push(data[index++]);
                }
                conv_bias.push(bias);
            };
            const readLinearLayer = (in_size, out_size) => {
                let weight = [];
                let bias = [];
                for(let i = 0; i < in_size; i++) {
                    let w = [];
                    for(let j = 0; j < out_size; j++) {
                        w.push(data[index++]);
                    }
                    weight.push(w);
                }
                for(let i = 0; i < out_size; i++) {
                    bias.push(data[index++]);
                }
                linear_weight.push(weight);
                linear_bias.push(bias);
            };
            readConv2dLayer(1, 4, 3);
            readConv2dLayer(4, 8, 3);
            readConv2dLayer(8, 16, 3);
            readLinearLayer(16 * 7 * 7, 10);
            if(index != data.length) {
                alert("Weights aren\'t loaded correctly.");
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
        // Structure: Input (28*28*1=784) -> Conv3-4 (relu) -> MaxPooling -> Conv3-8 (relu) -> Conv3-16 (relu) -> MaxPooling -> Flatten -> Linear (softmax)
        const Conv2d = (input, conv_id, padding) => {
            const Conv2d_single = (input, kernel, padding) => {
                const Padding = (input, padding, value) => {
                    const height = input.length;
                    const width = input[0].length;
                    let result = [];
                    // Top
                    for(let iter = 0; iter < padding; iter++) {
                        result.push(Array(width + padding * 2).fill(value));
                    }
                    for(let j = 0; j < height; j++) {
                        let row = [];
                        // Left
                        for(let cnt = 0; cnt < padding; cnt++) {
                            row.push(value);
                        }
                        // Middle
                        for(let k = 0; k < width; k++) {
                            row.push(input[j][k]);
                        }
                        // Right
                        for(let cnt = 0; cnt < padding; cnt++) {
                            row.push(value);
                        }
                        result.push(row);
                    }
                    // Bottom
                    for(let iter = 0; iter < padding; iter++) {
                        result.push(Array(width + padding * 2).fill(value));
                    }
                    return result;
                };
                input = Padding(input, padding, 0);
                const kernel_size = kernel.length;
                let result = [];
                for(let i = 0; i + kernel_size - 1 < input.length; i++) {
                    let row = [];
                    for(let j = 0; j + kernel_size - 1 < input[i].length; j++) {
                        let value = 0;
                        for(let di = 0; di < kernel_size; di++) {
                            for(let dj = 0; dj < kernel_size; dj++) {
                                value += input[i + di][j + dj] * kernel[di][dj];
                            }
                        }
                        row.push(value);
                    }
                    result.push(row);
                }
                return result;
            };
            const in_channels = conv_weight[conv_id][0].length;
            const out_channels = conv_bias[conv_id].length;
            const kernel_size = conv_weight[conv_id][0][0].length;
            const height = input[0].length;
            const width = input[0][0].length;
            let result = [];
            for(let o = 0; o < out_channels; o++) {
                let img = Array.from(Array(height), () => new Array(width).fill(conv_bias[conv_id][o]));
                for(let i = 0; i < in_channels; i++) {
                    let other = Conv2d_single(input[i], conv_weight[conv_id][o][i], padding);
                    for(let x = 0; x < height; x++) {
                        for(let y = 0; y < width; y++) {
                            img[x][y] += other[x][y];
                        }
                    }
                }
                result.push(img);
            }
            console.log(result.length, result[0].length, result[0][0].length);
            return result;
        };
        const ReLU = (input) => {
            for(let i = 0; i < input.length; i++) {
                for(let j = 0; j < input[i].length; j++) {
                    for(let k = 0; k < input[i][j].length; k++) {
                        input[i][j][k] = Math.max(input[i][j][k], 0)
                    }
                }
            }
            return input;
        };
        const MaxPooling = (input, kernel_size, stride) => {
            // console.log("all", input);
            const MaxPooling_single = (input, kernel_size, stride) => {
                // console.log(input);
                let result = [];
                for(let i = 0; i < input.length; i += stride) {
                    let row = [];
                    for(let j = 0; j < input[i].length; j += stride) {
                        let value = -Infinity;
                        for(let di = 0; di < kernel_size; di++) {
                            for(let dj = 0; dj < kernel_size; dj++) {
                                value = Math.max(value, input[i + di][j + dj]);
                            }
                        }
                        row.push(value);
                    }
                    result.push(row);
                }
                return result;
            };
            for(let i = 0; i < input.length; i++) {
                input[i] = MaxPooling_single(input[i], kernel_size, stride);
            }
            return input;
        };
        const Flatten = (input) => {
            let result = [];
            if(input.length == undefined) {
                result = [input];
            } else {
                input.forEach((e) => {
                    e = Flatten(e);
                    e.forEach((x) => {
                        result.push(x);
                    });
                });
            }
            return result;
        };
        const Linear = (input, linear_id) => {
            let in_size = linear_weight[linear_id].length;
            let out_size = linear_bias[linear_id].length;
            let result = Array.from(linear_bias[linear_id]);
            for(let i = 0; i < in_size; i++) {
                for(let j = 0; j < out_size; j++) {
                    result[j] += input[i] * linear_weight[linear_id][i][j];
                }
            }
            return result;
        };
        const Softmax = (input) => {
            let exp = [];
            let exp_sum = 0;
            for(let i = 0; i < input.length; i++) {
                exp.push(Math.exp(input[i]));
                exp_sum += exp[i];
            }
            for(let i = 0; i < input.length; i++) {
                input[i] = exp[i] / exp_sum;
            }
            return input;
        };
        let x = [image];
        x = ReLU(Conv2d(x, 0, 1));
        // console.log("conv1", x);
        x = MaxPooling(x, 2, 2);
        // console.log("maxpooling1", x);
        x = ReLU(Conv2d(x, 1, 1));
        x = ReLU(Conv2d(x, 2, 1));
        x = MaxPooling(x, 2, 2);
        x = Flatten(x)
        x = Softmax(Linear(x, 0))
        probability = x;
    }
    for(let i = 0; i < bars.children.length; i++) {
        const label = bars.children[i];
        const bar = label.children[0];
        bar.value = probability[i] * 100;
    }
};

const FPS = 60;
setInterval(updateProbability, 1000 / FPS);
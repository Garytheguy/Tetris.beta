class Block {
    constructor(position) {
        this.position = position;
    }
}

class BombBlock extends Block {
    constructor(position) {
        super(position);
        this.type = 'bomb';
    }

    explode(grid) {
        // 消除周圍的方塊
        for (let x = this.position.x - 1; x <= this.position.x + 1; x++) {
            for (let y = this.position.y - 1; y <= this.position.y + 1; y++) {
                if (x >= 0 && x < grid.width && y >= 0 && y < grid.height) {
                    grid.clearBlock(x, y);
                }
            }
        }
    }
}

class InvisibleBlock extends Block {
    constructor(position) {
        super(position);
        this.type = 'invisible';
        this.visible = false;
        this.timer = 5; // 5秒後顯現
    }

    update() {
        if (!this.visible) {
            this.timer -= 1;
            if (this.timer <= 0) {
                this.visible = true;
            }
        }
    }
}

class StickyBlock extends Block {
    constructor(position) {
        super(position);
        this.type = 'sticky';
    }

    affectNeighbors(grid) {
        // 影響相鄰方塊的移動
        for (let neighbor of this.getAdjacentBlocks(grid)) {
            neighbor.speed = 0; // 假設影響是讓相鄰方塊無法移動
        }
    }
}

// 其他遊戲邏輯和渲染代碼
function checkForSpecialBlocks(blocks, grid) {
    blocks.forEach(block => {
        if (block instanceof BombBlock) {
            block.explode(grid);
        }
    });
}

function updateBlocks(blocks) {
    blocks.forEach(block => {
        if (block instanceof InvisibleBlock) {
            block.update();
        }
    });
}

function checkForStickyBlocks(blocks, grid) {
    blocks.forEach(block => {
        if (block instanceof StickyBlock) {
            block.affectNeighbors(grid);
        }
    });
}

function checkForCombinations(blocks) {
    blocks.forEach(block => {
        if (isSpecialCombination(block)) {
            triggerCombinationEffect(block);
        }
    });
}

function isSpecialCombination(block) {
    // 判斷是否形成特定形狀
    // 這裡可以根據遊戲需求設計具體的判斷邏輯
    return false;
}

function triggerCombinationEffect(block) {
    // 觸發合成效果或消除效果
}

// 初始化和渲染遊戲
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = 'red'; // 可以根據方塊類型設置不同顏色
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawMatrix(player.matrix, player.pos);
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [5, 5, 5],
            [0, 5, 0],
        ];
    }
    // 可以添加其他類型的方塊
}

const player = {
    pos: {x: 5, y: 5},
    matrix: createPiece('T'),
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        player.pos.y++;
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        player.pos.x--;
    } else if (event.keyCode === 39) {
        player.pos.x++;
    } else if (event.keyCode === 40) {
        player.pos.y++;
    }
});

update(); 

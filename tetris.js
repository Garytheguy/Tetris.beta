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

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
    }
}

const arena = createMatrix(12, 20);

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

playerReset();
update(); 

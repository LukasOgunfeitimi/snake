const canvas = document.getElementById('game')

document.body.style.overflow = 'hidden'
document.body.style.backgroundColor = 'black'

canvas.style.position = 'absolute'

canvas.height = 500
canvas.width = 500

function resizeBoard() {
    canvas.style.left = (window.innerWidth / 2) - (canvas.width / 2) + 'px'
    canvas.style.top = (window.innerHeight / 2) - (canvas.height / 2) + 'px'
}
resizeBoard()

window.addEventListener('resize', resizeBoard);


const ctx = canvas.getContext('2d')

class Block {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.index = this.getIndex()
    }
    getIndex() {
        return this.x / 20 * canvas.height / 20 + this.y / 20
    }
}

class Player {
    constructor() {
        this.blocks = [new Block(40, 0)]

        this.allBlocks = this.createCache()
        this.dx = 0;
        this.dy = 0;
        this.changeDirection(1, 0)

        this.canvasIncrementor = 20;

        this.addListeners()

        this.food = this.foodBlock()

    }

    createCache() {
        const allBlocks = [];
        for (var i = 0; i < canvas.height; i += 20) {
            for (var j = 0; j < canvas.width; j += 20) {
                allBlocks.push(new Block(i, j))
            }
        }
        return allBlocks
    }

    foodBlock() {
        let allBlocks = structuredClone(this.allBlocks);
        
        for (var i = 0; i < this.blocks.length; i++) {
            delete allBlocks[this.blocks[i].getIndex()];
        }

        allBlocks = allBlocks.filter(b => b)

        return allBlocks[Math.floor(Math.random() * allBlocks.length)]
    }

    addBlock() {
        const lastBlock = this.blocks[this.blocks.length - 1];
        this.blocks.push(new Block(
            (-(this.dx * this.canvasIncrementor) + lastBlock.x), 
            (-(this.dy * this.canvasIncrementor) + lastBlock.y)));
    }

    lose() {
        this.blocks = [];
        console.log('you lose');
    }

    addListeners() {
        const moveMap = {
            ArrowUp: () => this.changeDirection(0, -1),
            ArrowDown: () => this.changeDirection(0, 1),
            ArrowLeft: () => this.changeDirection(-1, 0),
            ArrowRight: () => this.changeDirection(1, 0),
        }
        document.addEventListener('keydown', key => {
            if (!key.key.includes('Arrow')) return
            moveMap[key.key]()
        })
    }
    
    changeDirection(dx, dy) {
        if (this.dx === -dx && this.dy === -dy) return;
        this.dx = dx;
        this.dy = dy;
    }


    move() {
        const head = this.blocks[0];

        this.targetX = head.x + this.dx * this.canvasIncrementor;
        this.targetY = head.y + this.dy * this.canvasIncrementor;

        for (let i = this.blocks.length - 1; i > 0; i--) {
            this.blocks[i].x = this.blocks[i - 1].x;
            this.blocks[i].y = this.blocks[i - 1].y;
        }

        head.x = this.targetX
        head.y = this.targetY

        if (!this.newCoords(head)) {
            this.lose();
        }
    }

    newCoords(pos) {
        //food
        if (pos.x === this.food.x && 
            pos.y === this.food.y
        )  {
            this.food = this.foodBlock()
            this.addBlock()
        }

        //collision
        for (let i = 1; i < this.blocks.length; i++) {
            const coords = this.blocks[i]
            if (
                pos.x === coords.x &&
                pos.y === coords.y
            ) return false
        }

        //transform
        if (pos.x < 0) pos.x = canvas.width - this.canvasIncrementor;
        else if (pos.x === canvas.width) pos.x = 0;

        if (pos.y < 0) pos.y = canvas.height - this.canvasIncrementor;
        if (pos.y === canvas.height) pos.y = 0;

        return pos;
    }
}

const p = new Player()

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = "white"
    for (let i = 0; i < p.blocks.length; i++) {
        ctx.fillRect(p.blocks[i].x, p.blocks[i].y, 18, 18)
    }

    ctx.fillStyle = "red"
    ctx.fillRect(p.food.x, p.food.y, 18, 18)
}

function world() {
    p.move()
}

setInterval(() => {
    world()
}, 100);

function animate() {
    requestAnimationFrame(animate);
    draw();
}
animate();

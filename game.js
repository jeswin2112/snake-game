class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        // Game speed configuration
        this.gameSpeed = 100; // milliseconds between frames (default speed)
        
        this.gridSize = 20;
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.gameOver = false;
        this.isPaused = false; // Add pause state
        
        this.updateScore();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add touch control handlers
        document.getElementById('touch-up').addEventListener('click', () => {
            if (this.direction !== 'down') this.direction = 'up';
        });
        document.getElementById('touch-down').addEventListener('click', () => {
            if (this.direction !== 'up') this.direction = 'down';
        });
        document.getElementById('touch-left').addEventListener('click', () => {
            if (this.direction !== 'right') this.direction = 'left';
        });
        document.getElementById('touch-right').addEventListener('click', () => {
            if (this.direction !== 'left') this.direction = 'right';
        });

        // Add speed slider handler
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        speedSlider.addEventListener('input', (e) => {
            this.gameSpeed = parseInt(e.target.value);
            speedValue.textContent = `${this.gameSpeed}ms`;
        });

        // Add pause button click handler
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            document.getElementById('pauseButton').textContent = this.isPaused ? 'Resume' : 'Pause';
        });

        // Add touch controls for mobile devices
        if ('ontouchstart' in window) {
            document.getElementById('touch-controls').style.display = 'flex';
        }

        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down') this.direction = 'up';
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up') this.direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right') this.direction = 'left';
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left') this.direction = 'right';
                    break;
            }
        });

        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return { x, y };
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
    }

    startGame() {
        // Remove game over message if it exists
        const gameOverElement = document.querySelector('.game-over');
        if (gameOverElement) {
            gameOverElement.remove();
        }

        this.gameOver = false;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = 'right';
        this.score = 0;
        this.food = this.generateFood();
        this.updateScore();
        
        // Clear any existing game loop
        clearInterval(this.gameInterval);
        
        // Start the game loop
        this.gameLoop();
    }

    gameLoop() {
        if (this.gameOver || this.isPaused) return;

        this.update();
        this.draw();

        // Use setTimeout to control game speed
        setTimeout(() => {
            this.gameLoop();
        }, this.gameSpeed); // Use current game speed setting
    }

    update() {
        // Skip update if game is paused
        if (this.isPaused) return;

        const head = { ...this.snake[0] };

        switch(this.direction) {
            case 'up': head.y -= 1; break;
            case 'down': head.y += 1; break;
            case 'left': head.x -= 1; break;
            case 'right': head.x += 1; break;
        }

        this.checkCollision();

        this.snake.unshift(head);

        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision() {
        // Check wall collision
        const head = this.snake[0];
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            this.gameOver = true;
            return;
        }

        // Check self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver = true;
                return;
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw food
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
        // Draw snake with pulsing effect
        this.ctx.fillStyle = '#000';
        this.snake.forEach((segment, index) => {
            const pulse = Math.sin(Date.now() / 100 + index * 10) * 2;
            this.ctx.fillRect(
                segment.x * this.gridSize + pulse,
                segment.y * this.gridSize + pulse,
                this.gridSize - 2 - pulse,
                this.gridSize - 2 - pulse
            );
        });
        if (this.gameOver) {
            let gameOverElement = document.querySelector('.game-over');
            if (!gameOverElement) {
                gameOverElement = document.createElement('div');
                gameOverElement.className = 'game-over';
                gameOverElement.textContent = 'Game Over!';
                document.body.appendChild(gameOverElement);
                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    localStorage.setItem('snakeHighScore', this.highScore.toString());
                }
            }
        }
    }
}

// Initialize the game
const game = new SnakeGame();

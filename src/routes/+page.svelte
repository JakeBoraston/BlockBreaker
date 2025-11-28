<script lang="ts">;
	import { onMount } from 'svelte';
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	const initialMinBallSpeed = 0;
	const initialMaxBallSpeed = 7;

	// Constants
	const GAME_CONFIG = $state({
		ball: {
			size: 5,
			initialVelocity: {
				x: Math.random() * 5,
				y: 1
			},
			initialPosition: { x: 10, y: 10 },
			restitution: 0.8
		},
		paddle: {
			width: 100,
			height: 5,
			bottomOffset: 15
		},
		canvas: {
			marginHorizontal: 10,
			marginVertical: 35
		},
		block: {
			height:10,
			width:30,
			padding: 4
		}
	});

	let canvas;
	let ctx;
	let clientRect = $state();

	let width = $derived(viewportWidth - GAME_CONFIG.canvas.marginHorizontal);
	let height = $derived(viewportHeight - GAME_CONFIG.canvas.marginVertical);

	// Game entities
	let ball = $state({
		size: GAME_CONFIG.ball.size,
		velocity: { ...GAME_CONFIG.ball.initialVelocity },
		position: { ...GAME_CONFIG.ball.initialPosition },
		acceleration: { x: 0, y: 0.2 },
		restitution: GAME_CONFIG.ball.restitution
	});
	let blocks = $state([]);
	// Game state for UI
	let mouse = $state({ x: 0, y: 0 });
	let gameStarted = $state(false);
	let gameOver = $state(false);
	let isShaking = $state(false);

	// Particle system for effects
	let particles = $state([]);

	// Space background elements
	let stars = $state([]);
	let nebulaClouds = $state([]);

	let paddle = $derived({
		width: GAME_CONFIG.paddle.width,
		height: GAME_CONFIG.paddle.height,
		position: function () {
			return {
				x: Math.min(Math.max(mouse.x, 0), width - GAME_CONFIG.paddle.width),
				y: height - GAME_CONFIG.paddle.height - GAME_CONFIG.paddle.bottomOffset
			};
		}
	});

	//block initialisation
	function initialiseBlocks() {
		const rows = 15;
		const cols = 15;
		const blockWidth = GAME_CONFIG.block.width;
		const blockHeight = GAME_CONFIG.block.height;
		const padding = GAME_CONFIG.block.padding;
		const gridWidth = cols * (blockWidth + padding) - padding;
		const leftMargin = (width - gridWidth) / 2;
		const topMargin = 25;
		//create grid
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				//get block position
				const isSpecialBlock = (Math.random() * 100) >= 2
				const x = leftMargin + col * (blockWidth + padding);
				const y = topMargin + row * (blockHeight + padding);
				const block = {
					position: { x: x, y: y },
					width: blockWidth,
					height: blockHeight,
					isSpecial: isSpecialBlock,
					color: isSpecialBlock ? '#4422ee': '#ff99dd',
					alive: true
				};
				blocks.push(block);
			}
		}
	}

	function handleMouse(event) {
		// Update clientRect to get current canvas position
		clientRect = canvas.getBoundingClientRect();
		mouse.x = event.clientX - clientRect.x;
		mouse.y = event.clientY - clientRect.y;

		if (!gameStarted) {
			gameStarted = true;
		}
	}

	// Helper functions for collision detection
	function handleWallCollision(ballPos, ballSize, boundary, velocity) {
		const newVelocity = -velocity * ball.restitution;
		const correctedPosition = 2 * boundary - ballPos;
		triggerScreenShake();
		createParticles(ball.position.x, ball.position.y, '#ff3838', 8);
		return { velocity: newVelocity, position: correctedPosition };
	}

	function triggerScreenShake() {
		isShaking = true;
		setTimeout(() => {
			isShaking = false;
		}, 200);
	}

	// Particle system functions
	function createParticles(x, y, color, count = 5) {
		for (let i = 0; i < count; i++) {
			particles.push({
				x: x + (Math.random() - 0.5) * 4,
				y: y + (Math.random() - 0.5) * 4,
				vx: (Math.random() - 0.5) * 4,
				vy: (Math.random() - 0.5) * 4,
				life: 2.0,
				decay: Math.random() * 0.05 + 0.01,
				size: Math.random() * 2 + 1,
				color: color
			});
		}
	}

	function updateParticles() {
		particles = particles.filter((particle) => {
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.life -= particle.decay;
			particle.vx *= 0.99;
			particle.vy *= 0.99;
			return particle.life > 0;
		});
	}

	function drawParticles() {
		particles.forEach((particle) => {
			ctx.save();
			ctx.globalAlpha = particle.life;
			ctx.shadowColor = particle.color;
			ctx.shadowBlur = 50;
			ctx.fillStyle = particle.color;
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		});
	}

	// Space background functions
	function initializeSpaceBackground() {
		// Create fewer stars for performance
		stars = [];
		for (let i = 0; i < 50; i++) {
			stars.push({
				x: Math.random() * width,
				y: Math.random() * height,
				size: Math.random() * 1.5 + 0.5,
				brightness: Math.random() * 0.6 + 0.4,
				twinkleSpeed: Math.random() * 0.01 + 0.002,
				twinklePhase: Math.random() * Math.PI * 2,
				color: '#ffffff'
			});
		}

		// Create fewer, simpler nebula clouds
		nebulaClouds = [];
		for (let i = 0; i < 2; i++) {
			nebulaClouds.push({
				x: Math.random() * width,
				y: Math.random() * height,
				size: Math.random() * 150 + 100,
				opacity: Math.random() * 0.2 + 0.05,
				drift: { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1 },
				color: '#4a0e4e'
			});
		}
	}

	function updateSpaceBackground() {
		// Update twinkling stars
		stars.forEach((star) => {
			star.twinklePhase += star.twinkleSpeed;
			star.currentBrightness = star.brightness * (0.5 + 0.5 * Math.sin(star.twinklePhase));
		});

		// Update drifting nebula clouds
		nebulaClouds.forEach((cloud) => {
			cloud.x += cloud.drift.x;
			cloud.y += cloud.drift.y;

			// Wrap around edges
			if (cloud.x > width + cloud.size) cloud.x = -cloud.size;
			if (cloud.x < -cloud.size) cloud.x = width + cloud.size;
			if (cloud.y > height + cloud.size) cloud.y = -cloud.size;
			if (cloud.y < -cloud.size) cloud.y = height + cloud.size;
		});
	}

	function drawSpaceBackground() {
		// Simple dark gradient background
		const bgGradient = ctx.createRadialGradient(
			width / 2,
			height / 2,
			0,
			width / 2,
			height / 2,
			Math.max(width, height)
		);
		bgGradient.addColorStop(0, '#1a0033');
		bgGradient.addColorStop(1, '#000000');
		ctx.fillStyle = bgGradient;
		ctx.fillRect(0, 0, width, height);

		// Draw simple stars without shadows for performance
		stars.forEach((star) => {
			ctx.globalAlpha = star.currentBrightness;
			ctx.fillStyle = star.color;
			ctx.beginPath();
			ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
			ctx.fill();
		});

		// Reset alpha
		ctx.globalAlpha = 1;
	}

	function checkBoundaryCollision(position, size, min, max) {
		return {
			hitMin: position - size <= min,
			hitMax: position + size >= max,
			minBoundary: min + size,
			maxBoundary: max - size
		};
	}

	onMount(() => {
		viewportWidth = window.innerWidth;
		viewportHeight = window.innerHeight;
		ctx = canvas.getContext('2d');
		clientRect = canvas.getBoundingClientRect();
		initialiseBlocks();
		// Initialize space background
		initializeSpaceBackground();

		function draw() {
			drawSpaceBackground();
			drawBlocks();
			drawBallTrail();
			drawBall();
			drawPaddle();
			drawParticles();
		}
		function drawBlocks() {
			blocks.forEach((block) => {
				if (block.alive) {
					ctx.beginPath();
					ctx.roundRect(block.position.x, block.position.y, block.width, block.height, 1);
					ctx.fillStyle = block.color;
					ctx.fill();
				}
			});
		}

		function drawBallTrail() {
			// Create a dramatic glowing trail effect
			const trailLength = 20;
			const currentX = ball.position.x;
			const currentY = ball.position.y;

			for (let i = 0; i < trailLength; i++) {
				const progress = i / trailLength;
				const alpha = (1 - progress) * 0.5;
				const trailX = currentX - ball.velocity.x * i * 0.8;
				const trailY = currentY - ball.velocity.y * i * 0.8;
				const trailSize = ball.size * (1 - progress * 0.8);

				ctx.save();
				ctx.globalAlpha = alpha;

				// Multiple glow layers for more dramatic effect
				for (let glow = 0; glow < 3; glow++) {
					const glowAlpha = alpha / (glow + 1);
					const glowSize = trailSize * (1 + glow * 0.5);
					const glowBlur = 15 + glow * 10;

					ctx.globalAlpha = glowAlpha;
					ctx.shadowColor = '#ff3838';
					ctx.shadowBlur = glowBlur;
					ctx.fillStyle = glow === 0 ? '#ff6b6b' : 'transparent';

					ctx.beginPath();
					ctx.arc(trailX, trailY, glowSize, 0, Math.PI * 2);
					ctx.fill();
				}

				ctx.restore();
			}
		}

		function drawBall() {
			const x = ball.position.x;
			const y = ball.position.y;
			const radius = ball.size;

			// Create glowing ball with gradient
			const gradient = ctx.createRadialGradient(
				x - radius * 0.3,
				y - radius * 0.3,
				0,
				x,
				y,
				radius * 1.5
			);
			gradient.addColorStop(0, '#ff6b6b');
			gradient.addColorStop(0.3, '#ee5a52');
			gradient.addColorStop(0.7, '#ff3838');
			gradient.addColorStop(1, '#cc1e1e');

			// Outer glow
			ctx.shadowColor = '#ff3838';
			ctx.shadowBlur = 20;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;

			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = gradient;
			ctx.fill();

			// Add subtle texture lines
			ctx.shadowBlur = 0;
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
			ctx.lineWidth = 0.5;
			for (let i = 0; i < 4; i++) {
				const angle = (i / 4) * Math.PI * 2;
				ctx.beginPath();
				ctx.moveTo(x + Math.cos(angle) * radius * 0.3, y + Math.sin(angle) * radius * 0.3);
				ctx.lineTo(x + Math.cos(angle) * radius * 0.8, y + Math.sin(angle) * radius * 0.8);
				ctx.stroke();
			}

			// Inner highlight (main)
			const highlight = ctx.createRadialGradient(
				x - radius * 0.4,
				y - radius * 0.4,
				0,
				x - radius * 0.4,
				y - radius * 0.4,
				radius * 0.6
			);
			highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
			highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = highlight;
			ctx.fill();

			// Small specular highlight
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
			ctx.beginPath();
			ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.2, 0, Math.PI * 2);
			ctx.fill();

			// Outer rim for definition
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.stroke();
		}

		function drawPaddle() {
			const pos = paddle.position();
			const x = pos.x;
			const y = pos.y;
			const w = paddle.width;
			const h = paddle.height;

			// Create gradient for paddle
			const gradient = ctx.createLinearGradient(x, y, x, y + h);
			gradient.addColorStop(0, '#4ecdc4');
			gradient.addColorStop(0.5, '#44a08d');
			gradient.addColorStop(1, '#2d5a87');

			// Outer glow
			ctx.shadowColor = '#4ecdc4';
			ctx.shadowBlur = 15;

			// Main paddle body with rounded corners
			ctx.beginPath();
			ctx.roundRect(x, y, w, h, h / 2);
			ctx.fillStyle = gradient;
			ctx.fill();

			// Add textured pattern
			ctx.shadowBlur = 0;
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
			ctx.lineWidth = 1;
			for (let i = 0; i < 3; i++) {
				ctx.beginPath();
				ctx.moveTo(x + 5 + i * 15, y);
				ctx.lineTo(x + 5 + i * 15, y + h);
				ctx.stroke();
			}

			// Top highlight
			const highlight = ctx.createLinearGradient(x, y, x, y + h * 0.3);
			highlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
			highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

			ctx.beginPath();
			ctx.roundRect(x, y, w, h * 0.3, h / 2);
			ctx.fillStyle = highlight;
			ctx.fill();

			// Edge borders for definition
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.roundRect(x, y, w, h, h / 2);
			ctx.stroke();

			// Reset shadow
			ctx.shadowBlur = 0;
		}

		function checkBounds() {
			// Horizontal collision
			const horizontal = checkBoundaryCollision(ball.position.x, ball.size, 0, width);
			if (horizontal.hitMin) {
				const result = handleWallCollision(
					ball.position.x,
					ball.size,
					horizontal.minBoundary,
					ball.velocity.x
				);
				ball.velocity.x = result.velocity;
				ball.position.x = result.position;
			}
			if (horizontal.hitMax) {
				const result = handleWallCollision(
					ball.position.x,
					ball.size,
					horizontal.maxBoundary,
					ball.velocity.x
				);
				ball.velocity.x = result.velocity;
				ball.position.x = result.position;
			}

			// Vertical collision
			const vertical = checkBoundaryCollision(ball.position.y, ball.size, 0, height);
			if (vertical.hitMin) {
				const result = handleWallCollision(
					ball.position.y,
					ball.size,
					vertical.minBoundary,
					ball.velocity.y
				);
				ball.velocity.y = result.velocity;
				ball.position.y = result.position;
			}
			if (vertical.hitMax) {
				// Game over when ball hits bottom
				gameOver = true;
				createParticles(ball.position.x, ball.position.y, '#ff0000', 15);
			}
		}

		function checkPaddle() {
			const paddlePos = paddle.position();
			const ballBottom = ball.position.y + ball.size;
			const ballLeft = ball.position.x - ball.size;
			const ballRight = ball.position.x + ball.size;

			const verticalContact = ballBottom >= paddlePos.y + paddle.height;
			const horizontalContact = ballRight >= paddlePos.x && ballLeft <= paddlePos.x + paddle.width;

			if (verticalContact && horizontalContact) {
				ball.velocity.y = -ball.velocity.y;
				const boundary = paddlePos.y - ball.size;
				ball.position.y = 2 * boundary - ball.position.y;
				triggerScreenShake();
				createParticles(ball.position.x, paddlePos.y, '#4ecdc4', 12);
			}
		}

		function updatePhysics() {
			// Update velocity from acceleration
			ball.velocity.x += ball.acceleration.x;
			ball.velocity.y += ball.acceleration.y;

			// Update position from velocity
			ball.position.x += ball.velocity.x;
			ball.position.y += ball.velocity.y;
		}

		function checkBlockCollision() {
			blocks.forEach((block) => {
				if (block.alive) {
					//find closest point
					const closestX = Math.max(
						block.position.x,
						Math.min(ball.position.x, block.position.x + block.width)
					);
					const closestY = Math.max(
						block.position.y,
						Math.min(ball.position.y, block.position.y + block.height)
					);
					const distanceX = ball.position.x - closestX;
					const distanceY = ball.position.y - closestY;
					const distanceSquared = distanceX * distanceX + distanceY * distanceY;

					if (distanceSquared < ball.size * ball.size) {
						if (Math.abs(distanceX) > Math.abs(distanceY)) {
							ball.velocity.x = -ball.velocity.x;
						} else {
							ball.velocity.y = -ball.velocity.y;
						}
						block.alive = false;
						triggerScreenShake();
						createParticles(closestX,closestY,block.color,5);
					}
				}
			});
		}

		function update() {
			updatePhysics();
			updateParticles();
			checkBlockCollision();
			checkPaddle();
			checkBounds();
			updateSpaceBackground();
		}

		function animate() {
			if (!gameOver) {
				update();
			}
			draw();
			requestAnimationFrame(animate);
		}

		animate();
	});

	$effect(() => {
		function updateDimensions() {
			viewportWidth = window.innerWidth;
			viewportHeight = window.innerHeight;
		}

		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	});
</script>

<div class="game-container" class:shake={isShaking}>
	<div class="background-glow"></div>
	<canvas onmousemove={handleMouse} bind:this={canvas} {width} {height} class="game-canvas"
	></canvas>

	{#if !gameStarted}
		<button
			class="start-screen"
			onclick={() => {
				gameStarted = true;
			}}
		>
			<h1>Block Breaker</h1>
			<p>Move to start</p>
		</button>
	{/if}

	{#if gameOver}
		<button
			class="game-over"
			onclick={() => {
				gameOver = false;
				gameStarted = false;
				ball.position.x = GAME_CONFIG.ball.initialPosition.x;
				ball.position.y = Math.random() * 500;
				ball.velocity.x = GAME_CONFIG.ball.initialVelocity.x;
				ball.velocity.y = GAME_CONFIG.ball.initialVelocity.y;
			}}
		>
			<h1>Game Over</h1>
			<p class="restart-hint">Click to restart</p>
		</button>
	{/if}
</div>

<style>
	/* Game Container with Background Effects */
	.game-container {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: radial-gradient(circle at 50% 50%, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%);
	}

	/* Animated Background Glow */
	.background-glow {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background:
			radial-gradient(circle at 25% 25%, rgba(255, 0, 150, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 75% 75%, rgba(0, 150, 255, 0.1) 0%, transparent 50%);
		animation: float 8s ease-in-out infinite alternate;
		z-index: -1;
	}

	@keyframes float {
		0% {
			transform: rotate(0deg) scale(1);
		}
		100% {
			transform: rotate(360deg) scale(1.1);
		}
	}

	/* Canvas with Filters and Effects */
	.game-canvas {
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		filter: brightness(1.2) contrast(1.2) saturate(1.3);
		box-shadow:
			0 0 50px rgba(255, 255, 255, 0.1),
			inset 0 0 20px rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		cursor: none;
		transition: all 0.3s ease;
	}

	.game-canvas:hover {
		filter: brightness(1.2) contrast(1.3) saturate(1.4);
		box-shadow:
			0 0 80px rgba(255, 255, 255, 0.2),
			inset 0 0 30px rgba(0, 0, 0, 0.3);
	}

	/* Screen Shake Animation */
	@keyframes shake {
		0%,
		100% {
			transform: translateX(0) translateY(0);
		}
		10% {
			transform: translateX(-2px) translateY(-1px);
		}
		20% {
			transform: translateX(2px) translateY(1px);
		}
		30% {
			transform: translateX(-3px) translateY(-2px);
		}
		40% {
			transform: translateX(3px) translateY(2px);
		}
		50% {
			transform: translateX(-2px) translateY(-1px);
		}
		60% {
			transform: translateX(2px) translateY(1px);
		}
		70% {
			transform: translateX(-1px) translateY(-2px);
		}
		80% {
			transform: translateX(1px) translateY(2px);
		}
		90% {
			transform: translateX(-1px) translateY(-1px);
		}
	}

	.shake {
		animation: shake 0.2s ease-in-out;
	}

	/* Start Screen */
	.start-screen {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: white;
		z-index: 20;
		animation: pulse 2s ease-in-out infinite alternate;
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: inherit;
	}

	.start-screen h1 {
		font-family: 'Courier New', monospace;
		font-size: 4rem;
		margin-bottom: 1rem;
		text-shadow:
			0 0 20px rgba(255, 255, 255, 0.8),
			0 0 40px rgba(0, 150, 255, 0.6);
		background: linear-gradient(45deg, #ff006e, #00f5ff);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.start-screen p {
		font-family: 'Courier New', monospace;
		font-size: 1.2rem;
		opacity: 0.8;
	}

	/* Game Over Screen */
	.game-over {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: white;
		z-index: 20;
		background: rgba(0, 0, 0, 0.9);
		padding: 2rem;
		border-radius: 20px;
		border: 2px solid rgba(255, 0, 0, 0.5);
		backdrop-filter: blur(20px);
		cursor: pointer;
		font-family: inherit;
		transition: all 0.3s ease;
	}

	.game-over:hover {
		background: rgba(0, 0, 0, 0.95);
		border-color: rgba(255, 0, 0, 0.7);
		transform: translate(-50%, -50%) scale(1.02);
	}

	.game-over h1 {
		font-family: 'Courier New', monospace;
		font-size: 3rem;
		margin-bottom: 1rem;
		color: #ff006e;
		text-shadow: 0 0 20px rgba(255, 0, 110, 0.8);
	}

	.game-over p {
		font-family: 'Courier New', monospace;
		font-size: 1.5rem;
	}

	.restart-hint {
		font-size: 1rem !important;
		opacity: 0.7;
		margin-top: 1rem;
		animation: pulse 2s ease-in-out infinite;
		text-align: center;
		width: 100%;
		display: block;
	}

	@keyframes pulse {
		0% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.5;
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.start-screen h1 {
			font-size: 2.5rem;
		}

		.start-screen p {
			font-size: 1rem;
		}
	}
</style>

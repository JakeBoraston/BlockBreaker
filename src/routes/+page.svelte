<script>
	import { onMount } from 'svelte';

	// Constants
	const GAME_CONFIG = {
		ball: {
			size: 2,
			initialVelocity: { x: 2, y: 2 },
			initialPosition: { x: 10, y: 10 },
			restitution: 1
		},
		paddle: {
			width: 50,
			height: 5,
			bottomOffset: 15
		},
		canvas: {
			marginHorizontal: 10,
			marginVertical: 35
		}
	};

	let canvas;
	let ctx;
	let clientRect = $state();

	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let width = $derived(viewportWidth - GAME_CONFIG.canvas.marginHorizontal);
	let height = $derived(viewportHeight - GAME_CONFIG.canvas.marginVertical);

	// Game entities with better organization
	let ball = $state({
		size: GAME_CONFIG.ball.size,
		velocity: { ...GAME_CONFIG.ball.initialVelocity },
		position: { ...GAME_CONFIG.ball.initialPosition },
		acceleration: { x: 0, y: 0 },
		restitution: GAME_CONFIG.ball.restitution
	});

	let mouse = $state({ x: 0, y: 0 });

	let paddle = $derived({
		width: GAME_CONFIG.paddle.width,
		height: GAME_CONFIG.paddle.height,
		position: function () {
			return {
				x: Math.min(Math.max(mouse.x, 0), width - this.width),
				y: height - this.height - GAME_CONFIG.paddle.bottomOffset
			};
		}
	});

	function handleMouse(event) {
		mouse.x = event.clientX - clientRect.x;
		mouse.y = event.clientY - clientRect.y;
	}

	// Helper functions for collision detection
	function handleWallCollision(ballPos, ballSize, boundary, velocity) {
		const newVelocity = -velocity * ball.restitution;
		const correctedPosition = 2 * boundary - ballPos;
		return { velocity: newVelocity, position: correctedPosition };
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

		function draw() {
			ctx.clearRect(0, 0, width, height);

			// Draw ball
			ctx.beginPath();
			ctx.arc(ball.position.x, ball.position.y, ball.size, 0, Math.PI * 2);
			ctx.fillStyle = 'red';
			ctx.fill();

			// Draw paddle
			ctx.fillStyle = 'green';
			ctx.fillRect(paddle.position().x, paddle.position().y, paddle.width, paddle.height);
		}

		function checkBounds() {
			// Horizontal collision
			const horizontal = checkBoundaryCollision(ball.position.x, ball.size, 0, width);
			if (horizontal.hitMin) {
				const result = handleWallCollision(ball.position.x, ball.size, horizontal.minBoundary, ball.velocity.x);
				ball.velocity.x = result.velocity;
				ball.position.x = result.position;
			}
			if (horizontal.hitMax) {
				const result = handleWallCollision(ball.position.x, ball.size, horizontal.maxBoundary, ball.velocity.x);
				ball.velocity.x = result.velocity;
				ball.position.x = result.position;
			}

			// Vertical collision
			const vertical = checkBoundaryCollision(ball.position.y, ball.size, 0, height);
			if (vertical.hitMin) {
				const result = handleWallCollision(ball.position.y, ball.size, vertical.minBoundary, ball.velocity.y);
				ball.velocity.y = result.velocity;
				ball.position.y = result.position;
			}
			if (vertical.hitMax) {
				const result = handleWallCollision(ball.position.y, ball.size, vertical.maxBoundary, ball.velocity.y);
				ball.velocity.y = result.velocity;
				ball.position.y = result.position;
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
				ball.velocity.y = -ball.velocity.y * ball.restitution;
				const boundary = paddlePos.y - ball.size;
				ball.position.y = 2 * boundary - ball.position.y;
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

		function update() {
			updatePhysics();
			checkPaddle();
			checkBounds();
		}

		function animate() {
			update();
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

<canvas onmousemove={handleMouse} bind:this={canvas} {width} {height}></canvas>


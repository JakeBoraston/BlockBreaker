<script>
	import { onMount } from 'svelte';

	let canvas;
	let ctx;
	let clientRect = $state();

	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let width = $derived(viewportWidth - 25);
	let height = $derived(viewportHeight - 20);
	function updateDimensions() {
		viewportWidth = window.innerWidth;
		viewportHeight = window.innerHeight;
	}

	let mouse = $state({ x: 0, y: 0 });

	let ball = {
		size: 2,
		velocity: { x: 2, y: 2 },
		position: { x: 10, y: 10 },
		acceleration: { x: 0, y: 0.1 },
		restitution: 1 // how much energy is lost at hitting a bound
	};

	let paddle = $derived({
		width: 50,
		position: function () {
			return {
				x: Math.min(Math.max(mouse.x, 0), width - this.width),
				y: height - paddle.height - 15
			};
		},
		height: 5
	});
	function handleMouse(event) {
		mouse.x = event.clientX - clientRect.x;
		mouse.y = event.clientY - clientRect.y;
	}

	onMount(() => {
		updateDimensions();
		ctx = canvas.getContext('2d');
		clientRect = canvas.getBoundingClientRect();

		//create the ball
		function draw() {
			ctx.clearRect(0, 0, width, height); // clear the canvas
			ctx.beginPath();
			ctx.arc(ball.position.x, ball.position.y, ball.size, 0, Math.PI * 2);
			ctx.fillStyle = 'red';
			ctx.fill();
			ctx.fillStyle = 'green';
			ctx.fillRect(paddle.position().x, paddle.position().y, paddle.width, paddle.height);
		}

		function checkBounds() {
			const hitRight = ball.position.x + ball.size >= width;
			const hitLeft = ball.position.x - ball.size <= 0;
			const hitBottom = ball.position.y + ball.size >= height;
			const hitTop = ball.position.y - ball.size <= 0;

			if (hitLeft) {
				ball.velocity.x = -ball.velocity.x * ball.restitution;
				const boundary = 0 + ball.size;
				ball.position.x = 2 * boundary - ball.position.x;
			}

			if (hitRight) {
				ball.velocity.x = -ball.velocity.x * ball.restitution;
				const boundary = width - ball.size;
				ball.position.x = 2 * boundary - ball.position.x;
			}
			if (hitBottom) {
				ball.velocity.y = -ball.velocity.y * ball.restitution;
				const boundary = height - ball.size;
				ball.position.y = 2 * boundary - ball.position.y;
			}
			if (hitTop) {
				ball.velocity.y = -ball.velocity.y * ball.restitution;
				const boundary = 0 + ball.size;
				ball.position.y = 2 * boundary - ball.position.y;
			}
		}

		function checkPaddle() {
			const paddleConnectedVertically =
				ball.position.y + ball.size >= paddle.position().y + paddle.height;
			const paddleConnectedHorizontal =
				ball.position.x + ball.size >= paddle.position().x &&
				ball.position.x - ball.size <= paddle.position().x + paddle.width;

			if (paddleConnectedVertically && paddleConnectedHorizontal) {
				ball.velocity.y = -ball.velocity.y * ball.restitution;
				const boundary = paddle.position().y - ball.size;
				ball.position.y = 2 * boundary - ball.position.y;
			}
		}
		//update the balls position based on the velocity, but update the velocity via the acceleration first
		function update() {
			ball.velocity.x = ball.velocity.x + ball.acceleration.x;
			ball.velocity.y = ball.velocity.y + ball.acceleration.y;

			ball.position.x = ball.position.x + ball.velocity.x;
			ball.position.y = ball.position.y + ball.velocity.y;
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
		updateDimensions();
		window.addEventListener('resize', updateDimensions);
		return () => {
			window.removeEventListener('resize', updateDimensions);
		};
	});
</script>

<canvas onmousemove={handleMouse} bind:this={canvas} {width} {height}></canvas>

<style>
	canvas {
		display: block;
		background: #111;
		cursor: none;
	}
</style>

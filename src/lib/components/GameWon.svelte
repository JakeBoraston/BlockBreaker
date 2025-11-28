<button
	class="game-won"
	onclick={() => {
		gameOver = false;
		gameWon = false;
		gameStarted = false;
		blocks = [];
		initialiseBlocks();
		ball.position.x = GAME_CONFIG.ball.initialPosition.x;
		ball.position.y = GAME_CONFIG.ball.initialPosition.y;
		ball.velocity.x = GAME_CONFIG.ball.initialVelocity.x;
		ball.velocity.y = GAME_CONFIG.ball.initialVelocity.y;
	}}
>
	<h1>You won!</h1>
	<p class="restart-hint">Click to play again</p>
</button>


<style>
    .game-won {
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
		border: 2px solid rgba(30, 255, 0, 0.5);
		backdrop-filter: blur(20px);
		cursor: pointer;
		font-family: inherit;
		transition: all 0.3s ease;
	}

</style>
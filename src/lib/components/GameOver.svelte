<script lang="ts">
	interface Props {
		onRestart: () => void;
	}
	let { onRestart }: Props = $props();
</script>

<button
	class="game-over"
	onclick={() => {
		onRestart();
	}}
>
	<h1>Game Over</h1>
	<p class="restart-hint">Click to restart</p>
</button>

<style>
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
</style>

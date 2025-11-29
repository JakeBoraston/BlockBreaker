<script>
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<div class="w-svw h-svh m-0 p-0 bg-red-500 flex flex-1">
	{@render children()}
</div>


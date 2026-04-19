<script>
	import { navigate } from '../lib/router.js';

	let { title, slug } = $props();
</script>

<header class="header">
	<button onclick={() => navigate(slug ? `/${slug}` : '/')}>← Back</button>
	<h2>{title}</h2>
</header>
<p class="todo">This screen will be built in a later step.</p>

<style>
	.header {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 16px;
	}
	.header h2 {
		margin: 0;
	}
	.todo {
		border: 1px dashed var(--fg-dim);
		padding: 16px;
		opacity: 0.7;
	}
</style>

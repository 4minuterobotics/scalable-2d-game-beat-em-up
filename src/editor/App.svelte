<script>
	import { path, matchRoute } from './lib/router.js';
	import GameList from './routes/GameList.svelte';
	import GameOverview from './routes/GameOverview.svelte';
	import CharacterEditor from './routes/CharacterEditor.svelte';
	import StageEditor from './routes/StageEditor.svelte';
	import SpriteSheetEditor from './routes/SpriteSheetEditor.svelte';
	import ImageCropper from './routes/ImageCropper.svelte';
	import InputBindings from './routes/InputBindings.svelte';
	import Placeholder from './routes/Placeholder.svelte';

	const route = $derived.by(() => {
		const p = $path;
		let params;
		if (p === '/') return { type: 'games' };
		if ((params = matchRoute('/:slug', p))) return { type: 'game', ...params };
		if ((params = matchRoute('/:slug/character/:name', p))) return { type: 'character', ...params };
		if ((params = matchRoute('/:slug/stage/:name', p))) return { type: 'stage', ...params };
		if ((params = matchRoute('/:slug/sprite-sheets', p))) return { type: 'sprite-sheets', ...params };
		if ((params = matchRoute('/:slug/crop', p))) return { type: 'crop', ...params };
		if ((params = matchRoute('/:slug/inputs', p))) return { type: 'inputs', ...params };
		if ((params = matchRoute('/:slug/sounds', p))) return { type: 'sounds', ...params };
		return { type: 'notfound', path: p };
	});
</script>

<main>
	<header class="app-header">
		<h1>Township Editor</h1>
	</header>

	<div class="content">
		{#if route.type === 'games'}
			<GameList />
		{:else if route.type === 'game'}
			<GameOverview slug={route.slug} />
		{:else if route.type === 'character'}
			<CharacterEditor slug={route.slug} name={route.name} />
		{:else if route.type === 'stage'}
			<StageEditor slug={route.slug} name={route.name} />
		{:else if route.type === 'sprite-sheets'}
			<SpriteSheetEditor slug={route.slug} />
		{:else if route.type === 'crop'}
			<ImageCropper slug={route.slug} />
		{:else if route.type === 'inputs'}
			<InputBindings slug={route.slug} />
		{:else if route.type === 'sounds'}
			<Placeholder title="Sounds" slug={route.slug} />
		{:else}
			<p>Not found: {route.path}</p>
		{/if}
	</div>
</main>

<style>
	main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 24px;
	}
	.app-header {
		border-bottom: 1px solid var(--fg-dim);
		padding-bottom: 12px;
		margin-bottom: 24px;
	}
	.app-header h1 {
		margin: 0;
	}
</style>

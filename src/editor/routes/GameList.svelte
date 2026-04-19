<script>
	import { navigate } from '../lib/router.js';
	import { listGames } from '../lib/gameFiles.js';

	const games = listGames();
</script>

<section>
	<h2>Games</h2>
	{#if games.length === 0}
		<p>No games found under <code>src/data/games/</code>.</p>
	{:else}
		<ul class="list">
			{#each games as { slug, game }}
				<li>
					<a href="#/{slug}" onclick={() => navigate(`/${slug}`)}>
						<strong>{game.title}</strong>
						<span class="slug">({slug})</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	.list {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 8px;
	}
	.list li {
		border: 1px solid var(--fg-dim);
		padding: 12px;
	}
	.list a {
		text-decoration: none;
		display: flex;
		gap: 8px;
		align-items: baseline;
	}
	.slug {
		opacity: 0.6;
		font-size: 12px;
	}
</style>

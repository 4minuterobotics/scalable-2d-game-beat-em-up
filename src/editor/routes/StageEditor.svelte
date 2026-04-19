<script>
	import { navigate } from '../lib/router.js';
	import { loadGameData } from '../lib/gameFiles.js';
	import { saveStage } from '../lib/api.js';

	let { slug, name } = $props();
	const data = loadGameData(slug);
	const source = data?.stages[name];
	let config = $state(source ? structuredClone(source) : null);

	let status = $state('');
	let saving = $state(false);

	const characterNames = $derived(Object.keys(data?.characters ?? {}).sort());
	const soundNames = $derived(Object.keys(data?.sounds ?? {}));

	async function save() {
		if (!config) return;
		saving = true;
		status = 'Saving…';
		try {
			await saveStage(slug, name, config);
			status = '✓ Saved. Reload the game tab to see changes applied.';
		} catch (err) {
			status = `Save failed: ${err.message}`;
		} finally {
			saving = false;
		}
	}

	function addEnemyWave() {
		if (!config.enemies) config.enemies = [];
		config.enemies.push({
			character: characterNames[0] ?? '',
			count: 1,
			x: 1000,
			xJitter: 0,
			yMin: 176,
			yMax: 376,
			speed: 1,
			health: 2,
		});
	}

	function removeEnemyWave(index) {
		config.enemies.splice(index, 1);
	}

	function addLayer() {
		if (!config.layers) config.layers = [];
		const maxOrder = config.layers.reduce((m, l) => Math.max(m, l.drawOrder ?? 0), 0);
		config.layers.push({
			id: `layer-${config.layers.length + 1}`,
			parallax: 0.5,
			drawOrder: maxOrder + 1,
			depth: 'background',
			items: [],
		});
	}

	function removeLayer(index) {
		config.layers.splice(index, 1);
	}

	function addItem(layerIndex) {
		if (!config.layers[layerIndex].items) config.layers[layerIndex].items = [];
		config.layers[layerIndex].items.push({
			image: '',
			x: 0,
			y: 0,
			count: 1,
			spacing: 0,
		});
	}

	function removeItem(layerIndex, itemIndex) {
		config.layers[layerIndex].items.splice(itemIndex, 1);
	}

	function ensureEnding() {
		if (!config.ending) {
			config.ending = {
				type: 'music',
				tileCount: 5,
				durationMs: 4000,
				music: null,
				boss: null,
				cutscene: null,
			};
		}
	}
	$effect(() => {
		if (config) ensureEnding();
	});
</script>

{#if !config}
	<header class="header">
		<button onclick={() => navigate(`/${slug}`)}>← Back</button>
		<h2>Stage "{name}" not found</h2>
	</header>
{:else}
	<header class="header">
		<button onclick={() => navigate(`/${slug}`)}>← {data.game.title}</button>
		<h2>Stage: {name}</h2>
	</header>

	<h3>Stage settings</h3>
	<section class="grid">
		<label>
			<span>display name</span>
			<input type="text" bind:value={config.name} />
		</label>
		<label>
			<span>length (tiles)</span>
			<input type="number" min="1" step="1" bind:value={config.lengthTiles} />
		</label>
		<label>
			<span>tile width (px)</span>
			<input type="number" min="1" step="1" bind:value={config.tileWidth} />
		</label>
		<label>
			<span>total length (derived)</span>
			<input type="text" readonly value={`${(config.lengthTiles ?? 0) * (config.tileWidth ?? 0)} px`} />
		</label>
	</section>

	<hr />

	<h3>Ending</h3>
	<section class="grid">
		<label>
			<span>type</span>
			<select bind:value={config.ending.type}>
				<option value="music">music</option>
				<option value="boss">boss (not yet in runtime)</option>
				<option value="cutscene">cutscene (not yet in runtime)</option>
			</select>
		</label>
		<label>
			<span>tile count (last N tiles)</span>
			<input type="number" min="0" step="1" bind:value={config.ending.tileCount} />
		</label>
		<label>
			<span>duration (ms)</span>
			<input type="number" min="0" step="100" bind:value={config.ending.durationMs} />
		</label>
		<label>
			<span>music sound</span>
			<select bind:value={config.ending.music}>
				<option value={null}>(none)</option>
				{#each soundNames as s}
					<option value={s}>{s}</option>
				{/each}
			</select>
		</label>
	</section>

	<hr />

	<h3>
		Layers <span class="count">({config.layers?.length ?? 0})</span>
		<button class="inline" onclick={addLayer}>+ Add layer</button>
	</h3>

	{#each config.layers ?? [] as layer, li (li)}
		<details class="block" open>
			<summary>
				<strong>{layer.id}</strong>
				<span class="summary-meta">
					parallax {layer.parallax.toFixed(2)} · draw {layer.drawOrder} · {layer.depth}
					· {layer.items?.length ?? 0} item{layer.items?.length === 1 ? '' : 's'}
				</span>
			</summary>

			<div class="body">
				<div class="grid">
					<label>
						<span>id</span>
						<input type="text" bind:value={layer.id} />
					</label>
					<label>
						<span>parallax rate</span>
						<input type="number" step="0.01" bind:value={layer.parallax} />
					</label>
					<label>
						<span>draw order</span>
						<input type="number" step="1" bind:value={layer.drawOrder} />
					</label>
					<label>
						<span>depth</span>
						<select bind:value={layer.depth}>
							<option value="background">background</option>
							<option value="foreground">foreground</option>
						</select>
					</label>
				</div>

				<div class="items-header">
					<strong>Items</strong>
					<div>
						<button class="inline" onclick={() => addItem(li)}>+ Add item</button>
						<button class="inline danger" onclick={() => removeLayer(li)}>Delete layer</button>
					</div>
				</div>

				{#each layer.items ?? [] as item, ii (ii)}
					<div class="item">
						<div class="grid">
							<label class="full">
								<span>image path</span>
								<input type="text" bind:value={item.image} placeholder="img/example.png" />
							</label>
							<label>
								<span>x</span>
								<input type="number" bind:value={item.x} />
							</label>
							<label>
								<span>y</span>
								<input type="number" bind:value={item.y} />
							</label>
							<label>
								<span>width (px, overrides widthScale)</span>
								<input type="number" bind:value={item.width} placeholder="(auto from widthScale)" />
							</label>
							<label>
								<span>height (px, overrides heightScale)</span>
								<input type="number" bind:value={item.height} placeholder="(auto from heightScale)" />
							</label>
							<label>
								<span>width scale</span>
								<input type="number" step="0.1" bind:value={item.widthScale} placeholder="1" />
							</label>
							<label>
								<span>height scale</span>
								<input type="number" step="0.1" bind:value={item.heightScale} placeholder="1" />
							</label>
							<label>
								<span>count (tile repeat)</span>
								<input type="number" min="1" bind:value={item.count} />
							</label>
							<label>
								<span>spacing (px)</span>
								<input type="number" bind:value={item.spacing} placeholder="(uses spacingScale)" />
							</label>
							<label>
								<span>spacing scale</span>
								<input type="number" step="0.1" bind:value={item.spacingScale} placeholder="1" />
							</label>
						</div>
						<button class="inline danger" onclick={() => removeItem(li, ii)}>Remove item</button>
					</div>
				{/each}
			</div>
		</details>
	{/each}

	<hr />

	<h3>
		Enemy waves <span class="count">({config.enemies?.length ?? 0})</span>
		<button class="inline" onclick={addEnemyWave}>+ Add wave</button>
	</h3>

	{#each config.enemies ?? [] as wave, wi (wi)}
		<details class="block" open>
			<summary>
				<strong>Wave {wi + 1}</strong>
				<span class="summary-meta">
					{wave.count}× {wave.character} at x={wave.x} (±{wave.xJitter})
				</span>
			</summary>

			<div class="body">
				<div class="grid">
					<label>
						<span>character</span>
						<select bind:value={wave.character}>
							{#each characterNames as n}
								<option value={n}>{n}{data.characters[n].kind ? ` (${data.characters[n].kind})` : ''}</option>
							{/each}
						</select>
					</label>
					<label>
						<span>count</span>
						<input type="number" min="1" bind:value={wave.count} />
					</label>
					<label>
						<span>x (spawn center)</span>
						<input type="number" bind:value={wave.x} />
					</label>
					<label>
						<span>x jitter</span>
						<input type="number" bind:value={wave.xJitter} />
					</label>
					<label>
						<span>y min</span>
						<input type="number" bind:value={wave.yMin} />
					</label>
					<label>
						<span>y max</span>
						<input type="number" bind:value={wave.yMax} />
					</label>
					<label>
						<span>speed</span>
						<input type="number" step="0.1" bind:value={wave.speed} />
					</label>
					<label>
						<span>health</span>
						<input type="number" step="1" bind:value={wave.health} />
					</label>
				</div>
				<button class="inline danger" onclick={() => removeEnemyWave(wi)}>Remove wave</button>
			</div>
		</details>
	{/each}

	<hr />

	<div class="actions">
		<button onclick={save} disabled={saving}>💾 Save stage</button>
		<span class="status">{status}</span>
	</div>
{/if}

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
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px 16px;
		margin-bottom: 12px;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	label.full {
		grid-column: span 2;
	}
	label span {
		font-size: 11px;
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.count {
		opacity: 0.5;
		font-size: 12px;
		margin-left: 6px;
	}
	.block {
		border: 1px solid var(--fg-dim);
		padding: 10px 12px;
		margin-bottom: 8px;
	}
	.block summary {
		cursor: pointer;
		display: flex;
		gap: 8px;
		align-items: baseline;
		flex-wrap: wrap;
	}
	.summary-meta {
		opacity: 0.7;
		font-size: 12px;
		margin-left: auto;
	}
	.body {
		padding-top: 12px;
	}
	.item {
		border: 1px dashed var(--fg-dim);
		padding: 10px;
		margin-bottom: 8px;
	}
	.items-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 10px 0 6px;
	}
	.actions {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.status {
		opacity: 0.8;
	}
	.inline {
		margin-left: 6px;
		padding: 4px 10px;
		font-size: 12px;
	}
	.danger {
		color: #ff9999;
		border-color: #ff9999;
	}
	.danger:hover {
		background: #ff9999;
		color: var(--bg);
	}
</style>

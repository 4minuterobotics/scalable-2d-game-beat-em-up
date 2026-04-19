<script>
	import { navigate } from '../lib/router.js';
	import { loadGameData } from '../lib/gameFiles.js';
	import { saveGame, saveCharacter } from '../lib/api.js';

	let { slug } = $props();
	const data = $derived(loadGameData(slug));
	const characterNames = $derived(data ? Object.keys(data.characters).sort() : []);

	let savingPlayer = $state(false);
	let playerStatus = $state('');

	async function createCharacter() {
		const raw = prompt('New character name (e.g., soldier, raider, homeless):');
		if (!raw) return;
		const name = raw.trim().toLowerCase();
		if (!/^[a-z][a-z0-9-]*$/.test(name)) {
			alert('Name must start with a letter and contain only lowercase letters, digits, or -');
			return;
		}
		if (data.characters[name]) {
			alert(`Character "${name}" already exists.`);
			return;
		}
		const kindAns = prompt('Kind? Type "player" or "enemy" (default: enemy):', 'enemy');
		const kind = kindAns === 'player' ? 'player' : 'enemy';
		const skeleton = {
			name,
			kind,
			draw: { width: 200, height: 200 },
			frameWidth: 200,
			frameHeight: 200,
			frameOffsetX: 0,
			speed: kind === 'player' ? 5 : 2,
			health: kind === 'player' ? 20 : 5,
			spriteCenterOffset: 0,
			startDirection: 'right',
			startAnimation: 'idle',
			animations: {},
			inputActions: {},
			soundSlots: {
				hurt: 'hurt',
				death: 'death',
			},
		};
		if (kind === 'enemy') {
			skeleton.ai = {
				detectRange: 500,
				stop: { x: 100, y: 10 },
				stopJitter: { x: 40, y: 30 },
				speechChance: 0,
				speechLines: [],
			};
		}
		try {
			await saveCharacter(slug, name, skeleton);
			alert(`Created "${name}". Next: open Sprite sheets to add an "idle" animation so the character can render.`);
			window.location.hash = `#/${slug}/sprite-sheets`;
			window.location.reload();
		} catch (err) {
			alert(`Failed to create character: ${err.message}`);
		}
	}

	async function setPlayerCharacter(name) {
		if (!data || !name || name === data.game.playerCharacter) return;
		savingPlayer = true;
		playerStatus = `Switching to ${name}…`;
		try {
			const res = await fetch(`/src/data/games/${slug}/game.json`);
			if (!res.ok) throw new Error(`${res.status} fetching game.json`);
			const cfg = await res.json();
			cfg.playerCharacter = name;
			await saveGame(slug, cfg);
			playerStatus = `✓ Player is now ${name}. Reload the game tab.`;
			data.game.playerCharacter = name;
		} catch (err) {
			playerStatus = `Save failed: ${err.message}`;
		} finally {
			savingPlayer = false;
		}
	}
</script>

{#if !data}
	<p>Game "{slug}" not found.</p>
	<button onclick={() => navigate('/')}>← Back</button>
{:else}
	<header class="header">
		<button onclick={() => navigate('/')}>← Games</button>
		<h2>{data.game.title}</h2>
		<a class="play-link" href="/?slug={data.slug}" target="_blank">▶ Play</a>
	</header>

	<section class="panels">
		<div class="panel">
			<h3>
				Characters
				<button class="panel-add" onclick={createCharacter}>+ New</button>
			</h3>
			<ul class="sublist">
				{#each Object.keys(data.characters) as name}
					<li>
						<a href="#/{slug}/character/{name}" onclick={() => navigate(`/${slug}/character/${name}`)}>
							{name}
						</a>
						<span class="tag">{data.characters[name].kind}</span>
					</li>
				{/each}
			</ul>
		</div>

		<div class="panel">
			<h3>Stages</h3>
			<ul class="sublist">
				{#each data.game.stageOrder ?? [] as name, i}
					<li>
						<span class="num">{i + 1}.</span>
						<a href="#/{slug}/stage/{name}" onclick={() => navigate(`/${slug}/stage/${name}`)}>
							{data.stages[name]?.name ?? name}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="panel">
			<h3>Assets</h3>
			<ul class="sublist">
				<li>
					<a href="#/{slug}/sprite-sheets" onclick={() => navigate(`/${slug}/sprite-sheets`)}>
						Sprite sheets
					</a>
				</li>
				<li>
					<a href="#/{slug}/crop" onclick={() => navigate(`/${slug}/crop`)}>
						Image cropper (bg-removal)
					</a>
				</li>
				<li>
					<a href="#/{slug}/inputs" onclick={() => navigate(`/${slug}/inputs`)}>
						Input bindings ({Object.keys(data.game.inputBindings ?? {}).length})
					</a>
				</li>
				<li>
					<a href="#/{slug}/sounds" onclick={() => navigate(`/${slug}/sounds`)}>
						Sounds ({Object.keys(data.sounds).length})
					</a>
				</li>
			</ul>
		</div>
	</section>

	<section class="meta">
		<h3>Game settings</h3>
		<dl>
			<dt>Slug</dt>
			<dd>{data.slug}</dd>
			<dt>Viewport</dt>
			<dd>{data.game.viewport?.width} × {data.game.viewport?.height}</dd>
			<dt>Player</dt>
			<dd>
				<select
					value={data.game.playerCharacter}
					onchange={(e) => setPlayerCharacter(e.currentTarget.value)}
					disabled={savingPlayer}
				>
					{#each characterNames as name}
						<option value={name}>{name}</option>
					{/each}
				</select>
				{#if playerStatus}<span class="inline-status">{playerStatus}</span>{/if}
			</dd>
			<dt>Stage order</dt>
			<dd>{(data.game.stageOrder ?? []).join(' → ')}</dd>
		</dl>
	</section>
{/if}

<style>
	.header {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 16px;
	}
	.header h2 {
		flex: 1;
		margin: 0;
	}
	.play-link {
		padding: 6px 12px;
		border: 1px solid var(--border);
		text-decoration: none;
	}
	.panels {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-bottom: 24px;
	}
	.panel {
		border: 1px solid var(--fg-dim);
		padding: 12px;
	}
	.sublist {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 4px;
	}
	.sublist li {
		display: flex;
		gap: 6px;
		align-items: baseline;
	}
	.tag {
		font-size: 11px;
		opacity: 0.6;
	}
	.num {
		opacity: 0.5;
		width: 20px;
	}
	.meta dl {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: 6px 12px;
		margin: 0;
	}
	.meta dt {
		opacity: 0.6;
	}
	.inline-status {
		margin-left: 10px;
		opacity: 0.8;
		font-size: 12px;
	}
	.panel-add {
		float: right;
		padding: 2px 8px;
		font-size: 11px;
	}
</style>

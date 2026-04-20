<script>
	import { navigate } from '../lib/router.js';
	import { loadGameData } from '../lib/gameFiles.js';
	import { saveCharacter } from '../lib/api.js';

	let { slug, name } = $props();
	const data = loadGameData(slug);
	const source = data?.characters[name];
	let config = $state(source ? structuredClone(source) : null);

	let status = $state('');
	let saving = $state(false);

	const animationNames = $derived(config ? Object.keys(config.animations ?? {}) : []);
	const soundSlotNames = $derived(config ? Object.keys(config.soundSlots ?? {}) : []);
	const animationOptionsWithNone = $derived(['', ...animationNames]);
	const MOVEMENT_RESERVED = new Set(['right', 'left', 'up', 'down', 'sprint']);
	const gameActionNames = $derived(
		data
			? Object.keys(data.game.inputBindings ?? {}).filter((a) => !MOVEMENT_RESERVED.has(a))
			: []
	);
	const bindableAnimationNames = $derived.by(() => {
		if (!config) return [];
		const locomotion = new Set([
			config.walkAnimation,
			config.runAnimation,
			config.startAnimation,
			config.hurtAnimation,
		].filter(Boolean));
		return animationNames.filter((n) => !locomotion.has(n));
	});

	async function save() {
		if (!config) return;
		saving = true;
		status = 'Saving…';
		try {
			await saveCharacter(slug, name, config);
			status = '✓ Saved. Reload the game tab to see changes applied.';
		} catch (err) {
			status = `Save failed: ${err.message}`;
		} finally {
			saving = false;
		}
	}

	function ensureAttack(animName) {
		if (!config.animations[animName].attack) {
			config.animations[animName].attack = {
				width: 100,
				height: 40,
				damage: 1,
				hitFrame: 0,
				frames: config.animations[animName].frames ?? 1,
				sounds: {},
			};
		}
	}

	function removeAttack(animName) {
		delete config.animations[animName].attack;
	}

	function parseIntList(value) {
		if (!value || typeof value !== 'string') return [];
		return value
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0)
			.map((s) => Number(s))
			.filter((n) => !Number.isNaN(n));
	}

	function formatIntList(arr) {
		return (arr ?? []).join(', ');
	}

	function addSoundSlot() {
		if (!config.soundSlots) config.soundSlots = {};
		const raw = prompt('Slot name (e.g., step, hurt, death):');
		if (!raw) return;
		const slot = raw.trim();
		if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(slot)) {
			alert('Slot name must start with a letter and contain only letters, numbers, _ or -.');
			return;
		}
		if (config.soundSlots[slot] !== undefined) {
			alert(`Slot "${slot}" already exists.`);
			return;
		}
		const firstSound = Object.keys(data.sounds)[0];
		config.soundSlots = { ...config.soundSlots, [slot]: firstSound ?? '' };
	}

	function removeSoundSlot(slot) {
		if (!config.soundSlots) return;
		if (!confirm(`Remove sound slot "${slot}"?`)) return;
		const next = { ...config.soundSlots };
		delete next[slot];
		config.soundSlots = next;
	}

	function bindAction(action, animName) {
		if (!config.inputActions) config.inputActions = {};
		if (animName === '') {
			const next = { ...config.inputActions };
			delete next[action];
			config.inputActions = next;
			return;
		}
		config.inputActions = { ...config.inputActions, [action]: animName };
	}
</script>

{#if !config}
	<header class="header">
		<button onclick={() => navigate(`/${slug}`)}>← Back</button>
		<h2>Character "{name}" not found</h2>
	</header>
{:else}
	<header class="header">
		<button onclick={() => navigate(`/${slug}`)}>← {data.game.title}</button>
		<h2>Character: {name}</h2>
		<span class="tag">{config.kind}</span>
	</header>

	<h3>Stats</h3>
	<section class="grid">
		<label>
			<span>kind</span>
			<select bind:value={config.kind}>
				<option value="player">player</option>
				<option value="enemy">enemy</option>
				<option value="npc">npc</option>
			</select>
		</label>

		<label>
			<span>speed</span>
			<input type="number" step="0.1" bind:value={config.speed} />
		</label>

		<label>
			<span>health</span>
			<input type="number" step="1" bind:value={config.health} />
		</label>

		<label>
			<span>draw width</span>
			<input type="number" step="1" bind:value={config.draw.width} />
		</label>

		<label>
			<span>draw height</span>
			<input type="number" step="1" bind:value={config.draw.height} />
		</label>

		<label>
			<span>frame width</span>
			<input type="number" step="1" bind:value={config.frameWidth} />
		</label>

		<label>
			<span>frame height</span>
			<input type="number" step="1" bind:value={config.frameHeight} />
		</label>

		<label>
			<span>frame offset X</span>
			<input type="number" step="1" bind:value={config.frameOffsetX} />
		</label>

		<label>
			<span>sprite center offset</span>
			<input type="number" step="1" bind:value={config.spriteCenterOffset} />
		</label>

		<label>
			<span>start direction</span>
			<select bind:value={config.startDirection}>
				<option value="right">right</option>
				<option value="left">left</option>
			</select>
		</label>

		<label>
			<span>start animation</span>
			<select bind:value={config.startAnimation}>
				{#each animationNames as anim}
					<option value={anim}>{anim}</option>
				{/each}
			</select>
		</label>

		<label>
			<span>walk animation</span>
			<select bind:value={config.walkAnimation}>
				<option value={undefined}>(default: "run")</option>
				{#each animationNames as anim}
					<option value={anim}>{anim}</option>
				{/each}
			</select>
		</label>

		<label>
			<span>run animation (sprint)</span>
			<select bind:value={config.runAnimation}>
				<option value={undefined}>(none — walk only)</option>
				{#each animationNames as anim}
					<option value={anim}>{anim}</option>
				{/each}
			</select>
		</label>

		<label>
			<span>sprint speed multiplier</span>
			<input type="number" step="0.1" min="1" bind:value={config.sprintSpeedMultiplier} placeholder="1.5" />
		</label>

		<label>
			<span>hurt animation (on taking damage)</span>
			<select bind:value={config.hurtAnimation}>
				<option value={undefined}>(none — stay on current animation)</option>
				{#each animationNames as anim}
					<option value={anim}>{anim}</option>
				{/each}
			</select>
		</label>
	</section>

	<hr />

	<h3>Animations <span class="count">({animationNames.length})</span></h3>

	{#each animationNames as animName (animName)}
		{@const anim = config.animations[animName]}
		<details class="anim" open={!!anim.attack}>
			<summary>
				<strong>{animName}</strong>
				{#if anim.attack}<span class="badge">attack</span>{/if}
				{#if anim.isCollision}<span class="badge">collision</span>{/if}
				{#if anim.isProjectile}<span class="badge">projectile</span>{/if}
				<span class="summary-meta">
					{anim.frames ?? '?'} frames · rate {anim.rate ?? '?'} ·
					{anim.loop ? 'loop' : 'once'}
					{#if !anim.loop && anim.next}
						→ {anim.next}
					{/if}
				</span>
			</summary>

			<div class="anim-body">
				<div class="grid">
					<label>
						<span>frames</span>
						<input type="number" min="1" step="1" bind:value={anim.frames} />
					</label>
					<label>
						<span>rate (ticks/frame)</span>
						<input type="number" min="1" step="1" bind:value={anim.rate} />
					</label>
					<label class="checkbox-row">
						<input type="checkbox" bind:checked={anim.loop} />
						<span>loop</span>
					</label>
					{#if !anim.loop}
						<label>
							<span>next animation</span>
							<select bind:value={anim.next}>
								{#each animationOptionsWithNone as opt}
									<option value={opt || undefined}>{opt || '(none)'}</option>
								{/each}
							</select>
						</label>
					{/if}
					<label>
						<span>frame offset X (override)</span>
						<input type="number" step="1" bind:value={anim.frameOffsetX} placeholder="(inherits)" />
					</label>
					<label>
						<span>footstep frames (comma-separated)</span>
						<input
							type="text"
							value={formatIntList(anim.footsteps)}
							oninput={(e) => (anim.footsteps = parseIntList(e.currentTarget.value))}
							placeholder="e.g., 0, 5"
						/>
					</label>
					<label class="checkbox-row">
						<input type="checkbox" bind:checked={anim.holdToRepeat} />
						<span>hold to repeat (loop while key is held; release returns to idle)</span>
					</label>
					<label class="checkbox-row">
						<input type="checkbox" bind:checked={anim.isProjectile} />
						<span>is projectile</span>
					</label>
					<label class="checkbox-row">
						<input type="checkbox" bind:checked={anim.isCollision} />
						<span>is collision (hit-variant sprite)</span>
					</label>
				</div>

				<div class="image-block">
					<label>
						<span>image (right)</span>
						<input type="text" bind:value={anim.image} />
					</label>
					<label>
						<span>mirrored image (left)</span>
						<input type="text" bind:value={anim.mirroredImage} />
					</label>
				</div>

				<div class="attack-block">
					{#if anim.attack}
						<div class="attack-header">
							<strong>Attack properties</strong>
							<button type="button" onclick={() => removeAttack(animName)}>Remove attack</button>
						</div>
						<div class="grid">
							<label>
								<span>attack width (px reach)</span>
								<input type="number" step="1" bind:value={anim.attack.width} />
							</label>
							<label>
								<span>attack height (px y-tolerance)</span>
								<input type="number" step="1" bind:value={anim.attack.height} />
							</label>
							<label>
								<span>damage</span>
								<input type="number" step="1" bind:value={anim.attack.damage} />
							</label>
							<label>
								<span>hit frame (0-indexed)</span>
								<input type="number" min="0" step="1" bind:value={anim.attack.hitFrame} />
							</label>
						</div>
						<div class="grid">
							<label>
								<span>sound: start</span>
								<select bind:value={anim.attack.sounds.start}>
									<option value={undefined}>(none)</option>
									{#each Object.keys(data.sounds) as s}
										<option value={s}>{s}</option>
									{/each}
								</select>
							</label>
							<label>
								<span>sound: voice</span>
								<select bind:value={anim.attack.sounds.startVoice}>
									<option value={undefined}>(none)</option>
									{#each Object.keys(data.sounds) as s}
										<option value={s}>{s}</option>
									{/each}
								</select>
							</label>
							<label>
								<span>sound: hit</span>
								<select bind:value={anim.attack.sounds.hit}>
									<option value={undefined}>(none)</option>
									{#each Object.keys(data.sounds) as s}
										<option value={s}>{s}</option>
									{/each}
								</select>
							</label>
						</div>
						<div class="image-block">
							<label>
								<span>hit sprite image (right)</span>
								<input type="text" bind:value={anim.attack.hitSprite.image} />
							</label>
							<label>
								<span>hit sprite image (left)</span>
								<input type="text" bind:value={anim.attack.hitSprite.mirroredImage} />
							</label>
						</div>
					{:else}
						<button type="button" onclick={() => ensureAttack(animName)}>+ Add attack</button>
					{/if}
				</div>
			</div>
		</details>
	{/each}

	<hr />

	<h3>Input actions <span class="count">({gameActionNames.length} game actions)</span></h3>
	<p class="dim">
		Pick an animation slot to play when each game-level action fires.
		Edit the action list + key bindings in the <a href="#/{slug}/inputs" onclick={() => navigate(`/${slug}/inputs`)}>Input bindings</a> page.
	</p>
	{#if gameActionNames.length > 0}
		<div class="grid">
			{#each gameActionNames as action}
				<label>
					<span>{action}</span>
					<select
						value={config.inputActions?.[action] ?? ''}
						onchange={(e) => bindAction(action, e.currentTarget.value)}
					>
						<option value="">(none)</option>
						{#each bindableAnimationNames as anim}
							<option value={anim}>{anim}</option>
						{/each}
					</select>
				</label>
			{/each}
		</div>
	{:else}
		<p class="dim">No game actions defined yet — open Input bindings first.</p>
	{/if}

	<hr />

	<h3>
		Sound slots <span class="count">({soundSlotNames.length})</span>
		<button class="inline" type="button" onclick={addSoundSlot}>+ Add slot</button>
	</h3>
	{#if soundSlotNames.length > 0}
		<div class="slot-grid">
			{#each soundSlotNames as slot}
				<div class="slot-row">
					<span class="slot-name">{slot}</span>
					<select bind:value={config.soundSlots[slot]}>
						<option value={undefined}>(none)</option>
						{#each Object.keys(data.sounds) as s}
							<option value={s}>{s}</option>
						{/each}
					</select>
					<button class="inline danger" type="button" onclick={() => removeSoundSlot(slot)}>×</button>
				</div>
			{/each}
		</div>
	{:else}
		<p class="dim">No sound slots. Click <strong>+ Add slot</strong> to add one (e.g., <code>step</code> for footsteps).</p>
	{/if}

	{#if config.ai}
		<hr />
		<h3>AI</h3>
		<div class="grid">
			<label>
				<span>detectRange</span>
				<input type="number" step="10" bind:value={config.ai.detectRange} />
			</label>
			<label>
				<span>stop.x</span>
				<input type="number" step="1" bind:value={config.ai.stop.x} />
			</label>
			<label>
				<span>stop.y</span>
				<input type="number" step="1" bind:value={config.ai.stop.y} />
			</label>
			<label>
				<span>speech chance (per frame)</span>
				<input type="number" step="0.001" bind:value={config.ai.speechChance} />
			</label>
			<label>
				<span>speech lines (comma-separated)</span>
				<input
					type="text"
					value={formatIntList(config.ai.speechLines ?? [])}
					oninput={(e) =>
						(config.ai.speechLines = e.currentTarget.value
							.split(',')
							.map((s) => s.trim())
							.filter(Boolean))}
				/>
			</label>
		</div>
	{/if}

	<hr />

	<div class="actions">
		<button onclick={save} disabled={saving}>💾 Save character</button>
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
	.tag {
		opacity: 0.6;
		font-size: 12px;
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
	label span {
		font-size: 11px;
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	label.checkbox-row {
		flex-direction: row;
		align-items: center;
	}
	label.checkbox-row span {
		font-size: 13px;
		opacity: 1;
		text-transform: none;
		letter-spacing: 0;
	}
	.actions {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.status {
		opacity: 0.8;
	}
	.count {
		opacity: 0.5;
		font-size: 12px;
	}
	.anim {
		border: 1px solid var(--fg-dim);
		padding: 10px 12px;
		margin-bottom: 8px;
	}
	.anim summary {
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
	.anim-body {
		padding-top: 12px;
	}
	.attack-block {
		border-top: 1px dashed var(--fg-dim);
		padding-top: 10px;
		margin-top: 8px;
	}
	.attack-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
	.image-block {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px 16px;
		margin-bottom: 12px;
	}
	.badge {
		background: var(--fg-dim);
		padding: 1px 6px;
		font-size: 10px;
	}
	.dim {
		opacity: 0.6;
	}
	.inline {
		margin-left: 6px;
		padding: 3px 10px;
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
	.slot-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px 16px;
		margin-bottom: 12px;
	}
	.slot-row {
		display: grid;
		grid-template-columns: 110px 1fr auto;
		gap: 8px;
		align-items: center;
	}
	.slot-name {
		font-family: monospace;
		opacity: 0.8;
	}
</style>

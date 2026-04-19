<script>
	import { navigate } from '../lib/router.js';
	import { loadGameData } from '../lib/gameFiles.js';
	import { saveGame } from '../lib/api.js';

	let { slug } = $props();
	const data = $derived(loadGameData(slug));

	let bindings = $state(null);
	let loaded = $state(false);
	let saving = $state(false);
	let status = $state('');

	$effect(() => {
		if (!data || loaded) return;
		bindings = structuredClone(data.game.inputBindings ?? {});
		loaded = true;
	});

	let capturing = $state(null); // action name we're capturing a key for

	function actionNames() {
		return bindings ? Object.keys(bindings) : [];
	}

	function addAction() {
		const raw = prompt('Action name (e.g., shootHigh, kickLow, crawl):');
		if (!raw) return;
		const name = raw.trim();
		if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(name)) {
			alert('Action name must start with a letter and contain only letters, numbers, _ or -.');
			return;
		}
		if (bindings[name] !== undefined) {
			alert(`Action "${name}" already exists.`);
			return;
		}
		bindings = { ...bindings, [name]: [] };
	}

	function renameAction(oldName) {
		const raw = prompt(`Rename "${oldName}" to:`, oldName);
		if (!raw) return;
		const newName = raw.trim();
		if (newName === oldName) return;
		if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(newName)) {
			alert('Action name must start with a letter and contain only letters, numbers, _ or -.');
			return;
		}
		if (bindings[newName] !== undefined) {
			alert(`Action "${newName}" already exists.`);
			return;
		}
		const next = {};
		for (const [k, v] of Object.entries(bindings)) {
			next[k === oldName ? newName : k] = v;
		}
		bindings = next;
	}

	function removeAction(name) {
		if (!confirm(`Remove action "${name}"? Any character mapping this action will keep its entry but no key will fire it.`)) return;
		const next = { ...bindings };
		delete next[name];
		bindings = next;
	}

	function removeKey(action, key) {
		bindings[action] = bindings[action].filter((k) => k !== key);
	}

	function startCapture(action) {
		capturing = action;
	}

	function normalizeKey(e) {
		switch (e.key) {
			case 'ArrowUp': return 'up';
			case 'ArrowDown': return 'down';
			case 'ArrowLeft': return 'left';
			case 'ArrowRight': return 'right';
			case ' ': return 'space';
			default: return e.key.toLowerCase();
		}
	}

	function handleKeydown(e) {
		if (!capturing) return;
		if (e.key === 'Escape') {
			capturing = null;
			return;
		}
		e.preventDefault();
		const key = normalizeKey(e);
		const current = bindings[capturing] ?? [];
		if (!current.includes(key)) {
			bindings[capturing] = [...current, key];
		}
		capturing = null;
	}

	async function save() {
		if (!bindings) return;
		saving = true;
		status = 'Saving…';
		try {
			const res = await fetch(`/src/data/games/${slug}/game.json`);
			if (!res.ok) throw new Error(`${res.status} fetching game.json`);
			const cfg = await res.json();
			cfg.inputBindings = bindings;
			await saveGame(slug, cfg);
			status = '✓ Saved. Reload the game tab.';
		} catch (err) {
			status = `Save failed: ${err.message}`;
		} finally {
			saving = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if !data}
	<p>Game "{slug}" not found.</p>
	<button onclick={() => navigate('/')}>← Games</button>
{:else}
	<header class="header">
		<button onclick={() => navigate(`/${slug}`)}>← {data.game.title}</button>
		<h2>Input bindings</h2>
	</header>

	<p class="hint">
		Each action is a named command (e.g., <code>attack1</code>, <code>shootHigh</code>). A character binds the action to an animation slot in its own editor; this page is just the key list.
	</p>

	<section>
		{#if bindings}
			<div class="actions-list">
				{#each actionNames() as action (action)}
					<div class="action-row">
						<div class="action-name">
							<button class="name-btn" onclick={() => renameAction(action)} title="Rename">{action}</button>
						</div>
						<div class="keys">
							{#each bindings[action] ?? [] as key}
								<button
									class="key-chip"
									onclick={() => removeKey(action, key)}
									title="Remove key"
								>
									<span>{key}</span>
									<span class="x">×</span>
								</button>
							{/each}
							{#if capturing === action}
								<span class="capturing">press a key… (Esc to cancel)</span>
							{:else}
								<button class="add-key" onclick={() => startCapture(action)}>+ key</button>
							{/if}
						</div>
						<button class="remove" onclick={() => removeAction(action)}>Remove</button>
					</div>
				{/each}
			</div>

			<button class="add-action" onclick={addAction}>+ Add action</button>

			<div class="footer">
				<button onclick={save} disabled={saving}>💾 Save input bindings</button>
				<span class="status">{status}</span>
			</div>
		{:else}
			<p class="dim">Loading…</p>
		{/if}
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
		margin: 0;
	}
	.hint {
		opacity: 0.7;
		margin-bottom: 16px;
	}
	.actions-list {
		display: grid;
		gap: 8px;
		margin-bottom: 16px;
	}
	.action-row {
		display: grid;
		grid-template-columns: 180px 1fr auto;
		gap: 12px;
		align-items: center;
		border: 1px solid var(--fg-dim);
		padding: 8px 12px;
	}
	.action-name {
		display: flex;
		align-items: center;
	}
	.name-btn {
		background: transparent;
		border: none;
		color: var(--fg);
		font-family: monospace;
		font-size: 14px;
		padding: 4px 0;
		cursor: pointer;
		text-align: left;
	}
	.name-btn:hover {
		text-decoration: underline;
	}
	.keys {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;
	}
	.key-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		background: var(--bg-panel);
		border: 1px solid var(--fg-dim);
		color: var(--fg);
		font-family: monospace;
		font-size: 12px;
		cursor: pointer;
	}
	.key-chip:hover {
		background: #ff9999;
		color: var(--bg);
		border-color: #ff9999;
	}
	.key-chip .x {
		opacity: 0.6;
		font-weight: bold;
	}
	.add-key {
		padding: 3px 8px;
		font-size: 12px;
		background: transparent;
		border: 1px dashed var(--fg-dim);
		color: var(--fg);
		cursor: pointer;
	}
	.capturing {
		font-size: 12px;
		color: #ffd24d;
		font-style: italic;
	}
	.remove {
		padding: 4px 10px;
		font-size: 12px;
		color: #ff9999;
		border-color: #ff9999;
		background: transparent;
	}
	.remove:hover {
		background: #ff9999;
		color: var(--bg);
	}
	.add-action {
		padding: 8px 16px;
		margin-bottom: 16px;
	}
	.footer {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.status {
		opacity: 0.8;
	}
	.dim {
		opacity: 0.6;
	}
</style>

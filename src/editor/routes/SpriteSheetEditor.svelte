<script>
	import { navigate } from '../lib/router.js';
	import { uploadAsset, saveCharacter } from '../lib/api.js';
	import { loadGameData } from '../lib/gameFiles.js';

	let { slug } = $props();

	const gameData = $derived(loadGameData(slug));
	const characterNames = $derived(gameData ? Object.keys(gameData.characters).sort() : []);

	let saveCharacterName = $state('');
	let saveSlotMode = $state('existing');
	let saveSlotExisting = $state('');
	let saveSlotNew = $state('');
	let saving = $state(false);
	let footstepFrames = $state(new Set());

	const imageModules = import.meta.glob('/img/**/*.{png,jpg,jpeg,webp,gif}', {
		eager: true,
		query: '?url',
		import: 'default',
	});
	let images = $state(
		Object.entries(imageModules)
			.map(([key, url]) => ({ path: key.replace(/^\//, ''), url }))
			.sort((a, b) => a.path.localeCompare(b.path))
	);

	let selected = $state(null);
	let cols = $state(1);
	let rows = $state(1);
	let loaded = $state(null);
	let canvas;
	let selectionStart = $state(null);
	let selectionEnd = $state(null);
	let projectileStart = $state(null);
	let projectileEnd = $state(null);
	let explosionStart = $state(null);
	let explosionEnd = $state(null);
	let rangeMode = $state('main'); // 'main' | 'projectile' | 'explosion'
	let status = $state('');
	let uploading = $state(false);

	const frameWidth = $derived(loaded && cols > 0 ? loaded.naturalWidth / cols : 0);
	const frameHeight = $derived(loaded && rows > 0 ? loaded.naturalHeight / rows : 0);

	function specFrom(start, end) {
		if (start == null || end == null) return null;
		const a = Math.min(start, end);
		const b = Math.max(start, end);
		const rowA = Math.floor(a / cols);
		const rowB = Math.floor(b / cols);
		if (rowA !== rowB) return { error: 'Selection must stay within one row' };
		return {
			row: rowA,
			startColumn: a % cols,
			frames: b - a + 1,
		};
	}

	const spec = $derived(specFrom(selectionStart, selectionEnd));
	const projectileSpec = $derived(specFrom(projectileStart, projectileEnd));
	const explosionSpec = $derived(specFrom(explosionStart, explosionEnd));

	function pickImage(path) {
		selected = path;
		selectionStart = null;
		selectionEnd = null;
		projectileStart = null;
		projectileEnd = null;
		explosionStart = null;
		explosionEnd = null;
		rangeMode = 'main';
		const img = new Image();
		img.onload = () => {
			loaded = img;
			requestAnimationFrame(draw);
		};
		img.src = imageModules['/' + path];
	}

	$effect(() => {
		cols;
		rows;
		selectionStart;
		selectionEnd;
		projectileStart;
		projectileEnd;
		explosionStart;
		explosionEnd;
		footstepFrames;
		if (loaded && canvas) draw();
	});

	function draw() {
		if (!canvas || !loaded) return;
		canvas.width = loaded.naturalWidth;
		canvas.height = loaded.naturalHeight;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(loaded, 0, 0);

		const fw = loaded.naturalWidth / cols;
		const fh = loaded.naturalHeight / rows;

		const drawRange = (start, end, color, errorColor, withFootsteps = false) => {
			if (start == null) return;
			const a = end == null ? start : Math.min(start, end);
			const b = end == null ? start : Math.max(start, end);
			const rowA = Math.floor(a / cols);
			const rowB = Math.floor(b / cols);
			ctx.fillStyle = color;
			if (rowA === rowB) {
				const x = (a % cols) * fw;
				ctx.fillRect(x, rowA * fh, fw * (b - a + 1), fh);
				if (withFootsteps && footstepFrames.size > 0) {
					ctx.fillStyle = 'rgba(255, 210, 77, 0.45)';
					for (const idx of footstepFrames) {
						const col = (a + idx) % cols;
						ctx.fillRect(col * fw, rowA * fh, fw, fh);
					}
					ctx.strokeStyle = '#ffd24d';
					ctx.lineWidth = 3;
					for (const idx of footstepFrames) {
						const col = (a + idx) % cols;
						ctx.strokeRect(col * fw + 1.5, rowA * fh + 1.5, fw - 3, fh - 3);
					}
				}
			} else {
				const ax = (a % cols) * fw;
				const bx = (b % cols) * fw;
				ctx.fillRect(ax, rowA * fh, fw * cols - ax, fh);
				for (let r = rowA + 1; r < rowB; r++) ctx.fillRect(0, r * fh, fw * cols, fh);
				ctx.fillRect(0, rowB * fh, bx + fw, fh);
				ctx.fillStyle = errorColor;
				ctx.fillRect(0, rowA * fh, canvas.width, (rowB - rowA + 1) * fh);
			}
		};
		drawRange(selectionStart, selectionEnd, 'rgba(77, 255, 77, 0.25)', 'rgba(255, 120, 120, 0.25)', true);
		drawRange(projectileStart, projectileEnd, 'rgba(77, 180, 255, 0.28)', 'rgba(255, 120, 120, 0.25)');
		drawRange(explosionStart, explosionEnd, 'rgba(255, 120, 80, 0.32)', 'rgba(255, 120, 120, 0.25)');

		// grid lines
		ctx.strokeStyle = 'rgba(77, 255, 77, 0.9)';
		ctx.lineWidth = 1;
		for (let c = 0; c <= cols; c++) {
			const x = Math.round(c * fw) + 0.5;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
		}
		for (let r = 0; r <= rows; r++) {
			const y = Math.round(r * fh) + 0.5;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}

		// numbers
		const fontSize = Math.max(10, Math.min(fw, fh) / 6);
		ctx.font = `bold ${fontSize}px monospace`;
		ctx.textBaseline = 'top';
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const label = `${r},${c}`;
				const x = c * fw + 4;
				const y = r * fh + 4;
				ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
				ctx.fillText(label, x + 1, y + 1);
				ctx.fillStyle = 'rgb(77, 255, 77)';
				ctx.fillText(label, x, y);
			}
		}
	}

	function onCanvasClick(ev) {
		if (!loaded) return;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const x = (ev.clientX - rect.left) * scaleX;
		const y = (ev.clientY - rect.top) * scaleY;
		const col = Math.min(cols - 1, Math.max(0, Math.floor(x / frameWidth)));
		const row = Math.min(rows - 1, Math.max(0, Math.floor(y / frameHeight)));
		const idx = row * cols + col;

		if (ev.shiftKey && rangeMode === 'main' && spec && !spec.error) {
			const rangeStart = Math.min(selectionStart, selectionEnd);
			const rangeEnd = Math.max(selectionStart, selectionEnd);
			if (idx < rangeStart || idx > rangeEnd) return;
			toggleFootstep(idx - rangeStart);
			return;
		}

		const setStart = (v) => {
			if (rangeMode === 'projectile') projectileStart = v;
			else if (rangeMode === 'explosion') explosionStart = v;
			else selectionStart = v;
		};
		const setEnd = (v) => {
			if (rangeMode === 'projectile') projectileEnd = v;
			else if (rangeMode === 'explosion') explosionEnd = v;
			else selectionEnd = v;
		};
		const start = rangeMode === 'projectile' ? projectileStart : rangeMode === 'explosion' ? explosionStart : selectionStart;
		const end = rangeMode === 'projectile' ? projectileEnd : rangeMode === 'explosion' ? explosionEnd : selectionEnd;

		if (start == null || (start != null && end != null)) {
			setStart(idx);
			setEnd(null);
		} else {
			setEnd(idx);
		}
	}

	function clearCurrentRange() {
		if (rangeMode === 'projectile') {
			projectileStart = null;
			projectileEnd = null;
		} else if (rangeMode === 'explosion') {
			explosionStart = null;
			explosionEnd = null;
		} else {
			selectionStart = null;
			selectionEnd = null;
		}
	}

	function clearSelection() {
		selectionStart = null;
		selectionEnd = null;
	}

	async function onUpload(ev) {
		const file = ev.currentTarget.files?.[0];
		if (!file) return;
		uploading = true;
		status = `Uploading ${file.name}…`;
		try {
			const result = await uploadAsset(file, { kind: 'image' });
			status = `✓ Saved to ${result.path}. Reloading…`;
			setTimeout(() => location.reload(), 500);
		} catch (err) {
			status = `Upload failed: ${err.message}`;
		} finally {
			uploading = false;
		}
	}

	function copySpec() {
		if (!spec || spec.error) return;
		const json = JSON.stringify(spec, null, 2);
		navigator.clipboard?.writeText(json);
		status = '✓ Copied spec to clipboard.';
	}

	function allImagePaths() {
		return Object.keys(imageModules).map((k) => k.replace(/^\//, ''));
	}

	function detectImagePair(path) {
		if (!path) return { image: path, mirroredImage: path };
		const paths = allImagePaths();
		const exists = (p) => paths.includes(p);

		const ext = (path.match(/\.[a-zA-Z0-9]+$/) ?? [''])[0];

		const candidates = [];
		// right <-> left (word boundary so "mirrored" in path isn't matched)
		if (/\bright\b/i.test(path)) {
			candidates.push({ image: path, mirroredImage: path.replace(/\bright\b/gi, 'left') });
		}
		if (/\bleft\b/i.test(path)) {
			candidates.push({ image: path.replace(/\bleft\b/gi, 'right'), mirroredImage: path });
		}
		// _mirrored suffix — scalableCharacters convention (Soldier_1_Spritelist.png + _mirrored.png)
		if (new RegExp(`_mirrored${ext.replace('.', '\\.')}$`).test(path)) {
			candidates.push({
				image: path.replace(new RegExp(`_mirrored(${ext.replace('.', '\\.')})$`), '$1'),
				mirroredImage: path,
			});
		} else if (ext) {
			candidates.push({
				image: path,
				mirroredImage: path.replace(new RegExp(`(${ext.replace('.', '\\.')})$`), `_mirrored$1`),
			});
		}

		for (const c of candidates) {
			if (c.image !== c.mirroredImage && exists(c.image) && exists(c.mirroredImage)) {
				return c;
			}
		}
		return { image: path, mirroredImage: path };
	}

	const imagePair = $derived(selected ? detectImagePair(selected) : null);

	function sheetFields() {
		const pair = imagePair ?? { image: selected, mirroredImage: selected };
		const fields = {
			image: pair.image,
			mirroredImage: pair.mirroredImage,
			row: spec.row,
			startColumn: spec.startColumn,
			frames: spec.frames,
			sheet: {
				image: pair.image,
				columns: cols,
				rows: rows,
				frameWidth: Math.round(frameWidth),
				frameHeight: Math.round(frameHeight),
				pixelWidth: loaded.naturalWidth,
				pixelHeight: loaded.naturalHeight,
			},
			footsteps: [...footstepFrames].sort((a, b) => a - b),
		};
		if (projectileSpec && !projectileSpec.error) {
			fields.projectile = {
				row: projectileSpec.row,
				startColumn: projectileSpec.startColumn,
				frames: projectileSpec.frames,
			};
		}
		if (explosionSpec && !explosionSpec.error) {
			fields.explosion = {
				row: explosionSpec.row,
				startColumn: explosionSpec.startColumn,
				frames: explosionSpec.frames,
			};
		}
		return fields;
	}

	function buildAnimationBlock() {
		const sheet = sheetFields();
		if (saveSlotMode === 'existing' && saveSlotExisting) {
			const existing = gameData?.characters[saveCharacterName]?.animations?.[saveSlotExisting] ?? {};
			return { ...existing, ...sheet };
		}
		return { rate: 5, loop: true, ...sheet };
	}

	function toggleFootstep(index) {
		const next = new Set(footstepFrames);
		if (next.has(index)) next.delete(index);
		else next.add(index);
		footstepFrames = next;
	}

	function clearFootsteps() {
		footstepFrames = new Set();
	}

	$effect(() => {
		if (saveSlotMode !== 'existing') return;
		if (!selectedSlotInfo) {
			footstepFrames = new Set();
			projectileStart = null;
			projectileEnd = null;
			explosionStart = null;
			explosionEnd = null;
			return;
		}
		const cfg = gameData?.characters[saveCharacterName];
		const anim = cfg?.animations?.[saveSlotExisting];
		const existing = Array.isArray(anim?.footsteps) ? anim.footsteps : [];
		footstepFrames = new Set(existing);
		if (anim?.projectile && cols > 0) {
			const p = anim.projectile;
			const s = p.row * cols + p.startColumn;
			projectileStart = s;
			projectileEnd = s + (p.frames ?? 1) - 1;
		} else {
			projectileStart = null;
			projectileEnd = null;
		}
		if (anim?.explosion && cols > 0) {
			const e = anim.explosion;
			const s = e.row * cols + e.startColumn;
			explosionStart = s;
			explosionEnd = s + (e.frames ?? 1) - 1;
		} else {
			explosionStart = null;
			explosionEnd = null;
		}
	});

	function basename(path) {
		if (!path) return '';
		return String(path).split('/').pop();
	}

	const existingSlots = $derived.by(() => {
		if (!gameData || !saveCharacterName) return [];
		const cfg = gameData.characters[saveCharacterName];
		if (!cfg?.animations) return [];
		return Object.entries(cfg.animations)
			.map(([name, anim]) => ({
				name,
				image: anim.image ?? anim.sheet?.image ?? '',
				frames: anim.frames ?? null,
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	const selectedCharacterHasStepSound = $derived.by(() => {
		if (!gameData || !saveCharacterName) return true;
		const cfg = gameData.characters[saveCharacterName];
		return !!cfg?.soundSlots?.step;
	});

	// System slots that aren't button-triggered but the engine/character still uses.
	const SYSTEM_SLOTS = ['idle', 'takeDamage', 'die', 'death'];

	const availableNewSlots = $derived.by(() => {
		if (!gameData) return [];
		const cfg = gameData.characters[saveCharacterName];
		const taken = new Set(cfg?.animations ? Object.keys(cfg.animations) : []);
		const fromBindings = Object.keys(gameData.game.inputBindings ?? {});
		const fromCharacter = [
			cfg?.walkAnimation,
			cfg?.runAnimation,
			cfg?.startAnimation,
			cfg?.hurtAnimation,
		].filter(Boolean);
		const all = new Set([...fromBindings, ...SYSTEM_SLOTS, ...fromCharacter]);
		return [...all]
			.filter((name) => !taken.has(name))
			.sort((a, b) => {
				// Put system slots first, then game actions, alphabetical within each.
				const aSys = SYSTEM_SLOTS.includes(a);
				const bSys = SYSTEM_SLOTS.includes(b);
				if (aSys !== bSys) return aSys ? -1 : 1;
				return a.localeCompare(b);
			})
			.map((name) => ({ name, kind: SYSTEM_SLOTS.includes(name) ? 'system' : 'action' }));
	});

	async function quickAddBinding() {
		const rawName = prompt('New game action name (e.g., dash, block, slide):');
		if (!rawName) return;
		const actionName = rawName.trim();
		if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(actionName)) {
			alert('Action name must start with a letter and contain only letters, numbers, _ or -.');
			return;
		}
		if (gameData.game.inputBindings?.[actionName]) {
			alert(`Action "${actionName}" already exists.`);
			return;
		}
		const rawKey = prompt(`Key to bind to "${actionName}" (single letter, "space", or an arrow name like "right"):`);
		if (!rawKey) return;
		const key = rawKey.trim().toLowerCase();
		try {
			const res = await fetch(`/src/data/games/${slug}/game.json`);
			if (!res.ok) throw new Error(`${res.status} fetching game.json`);
			const cfg = await res.json();
			cfg.inputBindings = cfg.inputBindings ?? {};
			cfg.inputBindings[actionName] = [key];
			await fetch('/_dev/save-game', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ gameSlug: slug, config: cfg }),
			});
			status = `✓ Added action "${actionName}" bound to "${key}". Reloading…`;
			setTimeout(() => window.location.reload(), 400);
		} catch (err) {
			status = `Failed to add binding: ${err.message}`;
		}
	}

	const selectedSlotInfo = $derived(
		existingSlots.find((s) => s.name === saveSlotExisting) ?? null
	);

	const frameMismatch = $derived.by(() => {
		if (saveSlotMode !== 'existing') return null;
		if (!selectedSlotInfo || !spec || spec.error) return null;
		if (selectedSlotInfo.frames == null) return null;
		if (selectedSlotInfo.frames === spec.frames) return null;
		return { current: selectedSlotInfo.frames, selected: spec.frames };
	});

	async function addStepSlotToCharacter() {
		if (!saveCharacterName) return;
		if (!gameData) return;
		const sounds = Object.keys(gameData.sounds ?? {});
		if (sounds.length === 0) {
			status = 'No sounds exist in sounds.json yet.';
			return;
		}
		const soundName = sounds.includes('step') ? 'step' : sounds[0];
		saving = true;
		status = `Adding step slot → ${soundName} to ${saveCharacterName}…`;
		try {
			const res = await fetch(`/src/data/games/${slug}/characters/${saveCharacterName}.json`);
			if (!res.ok) throw new Error(`${res.status} fetching character`);
			const cfg = await res.json();
			cfg.soundSlots = cfg.soundSlots ?? {};
			cfg.soundSlots.step = soundName;
			await saveCharacter(slug, saveCharacterName, cfg);
			status = `✓ Added soundSlots.step → "${soundName}" on ${saveCharacterName}. Reload the game tab.`;
		} catch (err) {
			status = `Save failed: ${err.message}`;
		} finally {
			saving = false;
		}
	}

	async function saveSpecToCharacter() {
		if (!spec || spec.error) return;
		if (!saveCharacterName) {
			status = 'Pick a character.';
			return;
		}
		const slotName = saveSlotMode === 'new' ? saveSlotNew.trim() : saveSlotExisting;
		if (!slotName) {
			status = 'Pick or name an animation slot.';
			return;
		}
		if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(slotName)) {
			status = 'Slot name must start with a letter and contain only letters, numbers, _ or -.';
			return;
		}
		saving = true;
		status = `Saving ${slotName} to ${saveCharacterName}…`;
		try {
			const res = await fetch(`/src/data/games/${slug}/characters/${saveCharacterName}.json`);
			if (!res.ok) throw new Error(`${res.status} fetching character`);
			const cfg = await res.json();
			cfg.animations = cfg.animations ?? {};
			const existing = cfg.animations[slotName];
			cfg.animations[slotName] = existing
				? { ...existing, ...sheetFields() }
				: { rate: 5, loop: true, ...sheetFields() };

			// Auto-wire: if the slot name matches a game action (excluding movement/
			// modifier + the character's own locomotion slots), link it in inputActions.
			let autoWired = false;
			const excluded = new Set([
				'right', 'left', 'up', 'down', 'sprint',
				cfg.walkAnimation,
				cfg.runAnimation,
				cfg.startAnimation,
				cfg.hurtAnimation,
			].filter(Boolean));
			const bindings = gameData?.game?.inputBindings ?? {};
			if (bindings[slotName] && !excluded.has(slotName)) {
				cfg.inputActions = cfg.inputActions ?? {};
				if (cfg.inputActions[slotName] !== slotName) {
					cfg.inputActions[slotName] = slotName;
					autoWired = true;
				}
			}

			await saveCharacter(slug, saveCharacterName, cfg);
			status = `✓ Saved animation "${slotName}" to ${saveCharacterName}${autoWired ? ` (auto-wired to the "${slotName}" key binding)` : ''}.`;
			if (saveSlotMode === 'new') {
				saveSlotMode = 'existing';
				saveSlotExisting = slotName;
				saveSlotNew = '';
			}
		} catch (err) {
			status = `Save failed: ${err.message}`;
		} finally {
			saving = false;
		}
	}
</script>

<header class="header">
	<button onclick={() => navigate(`/${slug}`)}>← Back</button>
	<h2>Sprite sheets</h2>
</header>

<section class="upload">
	<label class="upload-label">
		<strong>Upload new sprite sheet</strong>
		<input type="file" accept="image/*" onchange={onUpload} disabled={uploading} />
	</label>
	{#if status}<span class="status">{status}</span>{/if}
</section>

<hr />

<section class="layout">
	<aside class="sidebar">
		<h3>Images <span class="count">({images.length})</span></h3>
		<ul class="img-list">
			{#each images as img}
				<li>
					<button
						class="img-item"
						class:selected={selected === img.path}
						onclick={() => pickImage(img.path)}
					>
						<img src={img.url} alt={img.path} />
						<span class="path">{img.path}</span>
					</button>
				</li>
			{/each}
		</ul>
	</aside>

	<main class="preview">
		{#if !selected}
			<p class="dim">Pick an image on the left to view its grid.</p>
		{:else if !loaded}
			<p class="dim">Loading…</p>
		{:else}
			<div class="controls">
				<label>
					<span>columns</span>
					<input type="number" min="1" step="1" bind:value={cols} />
				</label>
				<label>
					<span>rows</span>
					<input type="number" min="1" step="1" bind:value={rows} />
				</label>
				<label>
					<span>frame size (derived)</span>
					<input type="text" readonly value={`${frameWidth.toFixed(1)} × ${frameHeight.toFixed(1)} px`} />
				</label>
				<label>
					<span>image natural size</span>
					<input type="text" readonly value={`${loaded.naturalWidth} × ${loaded.naturalHeight} px`} />
				</label>
			</div>

			<div class="range-tabs">
				<button
					class="range-tab main"
					class:active={rangeMode === 'main'}
					onclick={() => (rangeMode = 'main')}
				>Main (character)</button>
				<button
					class="range-tab projectile"
					class:active={rangeMode === 'projectile'}
					onclick={() => (rangeMode = 'projectile')}
				>+ Projectile</button>
				<button
					class="range-tab explosion"
					class:active={rangeMode === 'explosion'}
					onclick={() => (rangeMode = 'explosion')}
				>+ Explosion</button>
				<span class="range-summary">
					Main: {spec && !spec.error ? `${spec.frames}f @ r${spec.row}` : '—'}
					· Proj: {projectileSpec && !projectileSpec.error ? `${projectileSpec.frames}f @ r${projectileSpec.row}` : '—'}
					· Boom: {explosionSpec && !explosionSpec.error ? `${explosionSpec.frames}f @ r${explosionSpec.row}` : '—'}
				</span>
			</div>

			<p class="hint">
				{#if rangeMode === 'main'}
					Click two cells to select the character animation range. <strong>Shift+click</strong> a cell inside the range to toggle it as a footstep (or use the F buttons below).
				{:else if rangeMode === 'projectile'}
					Click two cells to select the flying projectile frames (bullet, fireball, etc). Optional — skip if this animation isn't a projectile attack.
				{:else}
					Click two cells to select the impact/explosion frames that play when the projectile collides. Optional.
				{/if}
				<button class="inline" onclick={clearCurrentRange}>Clear this range</button>
			</p>

			<div class="canvas-wrap">
				<canvas bind:this={canvas} onclick={onCanvasClick}></canvas>
			</div>

			{#if imagePair}
				<p class="pair-line">
					<strong>Right-facing:</strong> <code>{imagePair.image}</code>
					· <strong>Left (mirrored):</strong>
					{#if imagePair.image === imagePair.mirroredImage}
						<span class="warn-inline">same as right — no mirrored variant detected</span>
					{:else}
						<code>{imagePair.mirroredImage}</code>
					{/if}
				</p>
			{/if}

			<h3>Animation spec</h3>
			{#if !spec}
				<p class="dim">Click two cells to define a range.</p>
			{:else if spec.error}
				<p class="error">{spec.error}</p>
			{:else}
				<pre>{JSON.stringify(buildAnimationBlock(), null, 2)}</pre>
				<button onclick={copySpec}>Copy spec to clipboard</button>

				<div class="footsteps">
					<div class="footsteps-header">
						<strong>Footsteps</strong>
						<span class="dim">Click a frame to toggle (plays the character's <code>step</code> sound at runtime).</span>
						<button class="inline" onclick={clearFootsteps} disabled={footstepFrames.size === 0}>Clear</button>
					</div>
					<div class="footsteps-row">
						{#each Array(spec.frames) as _, i}
							<button
								class="fs-toggle"
								class:on={footstepFrames.has(i)}
								onclick={() => toggleFootstep(i)}
							>F{i}</button>
						{/each}
					</div>
				</div>

				<div class="save-to-character">
					<h4>Save to character</h4>
					<div class="save-row">
						<label>
							<span>character</span>
							<select bind:value={saveCharacterName} disabled={saving}>
								<option value="">— pick —</option>
								{#each characterNames as name}
									<option value={name}>{name}</option>
								{/each}
							</select>
						</label>
						<label>
							<span>slot</span>
							<select bind:value={saveSlotMode} disabled={saving}>
								<option value="existing">Existing</option>
								<option value="new">New</option>
							</select>
						</label>
						{#if saveSlotMode === 'existing'}
							<label>
								<span>animation</span>
								<select bind:value={saveSlotExisting} disabled={saving || !saveCharacterName}>
									<option value="">— pick —</option>
									{#each existingSlots as slot}
										<option value={slot.name}>
											{slot.name}{slot.frames != null ? ` (${slot.frames}f)` : ''}{slot.image ? ` — ${basename(slot.image)}` : ''}
										</option>
									{/each}
								</select>
							</label>
						{:else}
							<label>
								<span>new slot</span>
								<select bind:value={saveSlotNew} disabled={saving}>
									<option value="">— pick —</option>
									{#each availableNewSlots as opt}
										<option value={opt.name}>
											{opt.name}{opt.kind === 'system' ? ' (system)' : ''}
										</option>
									{/each}
								</select>
							</label>
							<button class="inline" onclick={quickAddBinding} disabled={saving} title="Add a new game action + key binding">+ binding</button>
						{/if}
						<button onclick={saveSpecToCharacter} disabled={saving || !spec || spec.error}>
							{saving ? 'Saving…' : 'Save'}
						</button>
					</div>
					{#if saveSlotMode === 'existing' && selectedSlotInfo}
						<p class="hint">
							Currently: {selectedSlotInfo.image ? basename(selectedSlotInfo.image) : '(no image)'}{selectedSlotInfo.frames != null ? `, ${selectedSlotInfo.frames} frames` : ''}. Will overwrite sheet fields; keeps <code>attack</code>, <code>next</code>, <code>footsteps</code>, etc.
						</p>
					{/if}
					{#if frameMismatch}
						<p class="warn">
							⚠ Frame count differs: slot <code>{saveSlotExisting}</code> currently has {frameMismatch.current}, you selected {frameMismatch.selected}. Check your selection or update downstream refs (<code>hitFrame</code>, <code>footsteps</code>).
						</p>
					{/if}
					{#if footstepFrames.size > 0 && saveCharacterName && !selectedCharacterHasStepSound}
						<p class="warn">
							⚠ <code>{saveCharacterName}</code> has no <code>step</code> sound slot. Footsteps will save, but nothing will play at runtime.
							<button class="inline" onclick={addStepSlotToCharacter} disabled={saving}>
								Add step slot
							</button>
						</p>
					{/if}
				</div>
			{/if}
		{/if}
	</main>
</section>

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
	.upload {
		display: flex;
		gap: 12px;
		align-items: center;
		padding: 12px;
		border: 1px dashed var(--fg-dim);
	}
	.upload-label {
		display: flex;
		gap: 12px;
		align-items: center;
		flex: 1;
	}
	.layout {
		display: grid;
		grid-template-columns: 260px 1fr;
		gap: 16px;
	}
	.sidebar {
		border-right: 1px solid var(--fg-dim);
		padding-right: 12px;
		max-height: calc(100vh - 220px);
		overflow-y: auto;
	}
	.img-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 4px;
	}
	.img-item {
		display: flex;
		gap: 8px;
		align-items: center;
		width: 100%;
		text-align: left;
		background: var(--bg);
		border: 1px solid transparent;
		padding: 4px 6px;
		cursor: pointer;
		color: var(--fg);
	}
	.img-item:hover {
		border-color: var(--fg-dim);
		background: var(--bg-panel);
	}
	.img-item.selected {
		border-color: var(--fg);
		background: var(--bg-panel);
	}
	.img-item img {
		width: 40px;
		height: 40px;
		object-fit: contain;
		background: #000;
	}
	.path {
		font-size: 11px;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.preview {
		min-width: 0;
	}
	.count {
		opacity: 0.5;
		font-size: 12px;
		margin-left: 6px;
	}
	.controls {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
		margin-bottom: 10px;
	}
	.controls label {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.controls span {
		font-size: 11px;
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.hint {
		margin: 4px 0 8px;
		opacity: 0.8;
	}
	.inline {
		padding: 2px 8px;
		font-size: 11px;
		margin-left: 6px;
	}
	.canvas-wrap {
		border: 1px solid var(--fg-dim);
		overflow: auto;
		max-width: 100%;
		max-height: 60vh;
		background: #000;
		margin-bottom: 12px;
	}
	canvas {
		display: block;
		max-width: 100%;
		height: auto;
		cursor: crosshair;
	}
	pre {
		background: var(--bg-panel);
		border: 1px solid var(--fg-dim);
		padding: 10px;
		max-height: 240px;
		overflow: auto;
	}
	.error {
		color: #ff9999;
	}
	.dim {
		opacity: 0.6;
	}
	.status {
		opacity: 0.8;
	}
	.save-to-character {
		margin-top: 16px;
		padding: 12px;
		border: 1px dashed var(--fg-dim);
	}
	.save-to-character h4 {
		margin: 0 0 8px;
	}
	.save-row {
		display: grid;
		grid-template-columns: 1.2fr 0.8fr 1.2fr auto;
		gap: 10px;
		align-items: end;
	}
	.save-row label {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.save-row span {
		font-size: 11px;
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.save-row button {
		height: 30px;
	}
	.warn {
		color: #ffd24d;
		margin: 6px 0 0;
	}
	.footsteps {
		margin-top: 14px;
		padding: 10px 12px;
		border: 1px dashed var(--fg-dim);
	}
	.footsteps-header {
		display: flex;
		gap: 10px;
		align-items: center;
		margin-bottom: 8px;
	}
	.footsteps-header .dim {
		flex: 1;
		opacity: 0.6;
		font-size: 12px;
	}
	.footsteps-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.fs-toggle {
		padding: 4px 10px;
		font-size: 12px;
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--fg-dim);
		cursor: pointer;
		min-width: 42px;
	}
	.fs-toggle.on {
		background: #ffd24d;
		color: #000;
		border-color: #ffd24d;
		font-weight: bold;
	}
	.pair-line {
		font-size: 12px;
		opacity: 0.85;
		margin: 4px 0 10px;
	}
	.warn-inline {
		color: #ffd24d;
		font-style: italic;
	}
	.range-tabs {
		display: flex;
		gap: 6px;
		align-items: center;
		flex-wrap: wrap;
		margin: 4px 0 4px;
	}
	.range-tab {
		padding: 4px 12px;
		font-size: 12px;
		background: transparent;
		color: var(--fg);
		border: 1px solid var(--fg-dim);
		cursor: pointer;
	}
	.range-tab.active {
		font-weight: bold;
	}
	.range-tab.main.active {
		background: rgba(77, 255, 77, 0.3);
		border-color: rgb(77, 255, 77);
	}
	.range-tab.projectile.active {
		background: rgba(77, 180, 255, 0.3);
		border-color: rgb(77, 180, 255);
	}
	.range-tab.explosion.active {
		background: rgba(255, 120, 80, 0.3);
		border-color: rgb(255, 120, 80);
	}
	.range-summary {
		font-size: 11px;
		opacity: 0.7;
		margin-left: auto;
		font-family: monospace;
	}
</style>

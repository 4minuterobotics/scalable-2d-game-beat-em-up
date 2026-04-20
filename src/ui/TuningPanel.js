import { Howler } from 'howler';
import openAudioTrimmer, { getTrim } from './AudioTrimmer.js';

const STYLE = `
	position: fixed; top: 10px; right: 10px;
	width: 340px; max-height: 90vh; overflow-y: auto;
	background: rgba(10, 15, 11, 0.92); color: #4dff4d;
	border: 2px solid #4dff4d; padding: 12px;
	font-family: monospace; font-size: 12px; line-height: 1.4;
	z-index: 9999; display: none;
	box-sizing: border-box;
`;

const SECTION_STYLE = 'margin-bottom:10px; border-top:1px solid #4dff4d; padding-top:6px;';
const HEADING_STYLE = 'font-weight:bold; color:#4dff4d; margin-bottom:4px;';
const SUBLABEL_STYLE = 'font-weight:bold; margin-top:6px; color:#fff;';
const BUTTON_STYLE = 'background:#1a1f1b; color:#4dff4d; border:1px solid #4dff4d; padding:6px 10px; cursor:pointer; width:100%;';

export default class TuningPanel {
	constructor({ onResetStage, stages = [], onSelectStage, characters = [], onSelectPlayer, currentPlayer = '', difficulty = 1, onChangeDifficulty } = {}) {
		this.world = null;
		this.onResetStage = onResetStage;
		this.stages = stages;
		this.onSelectStage = onSelectStage;
		this.characters = characters;
		this.onSelectPlayer = onSelectPlayer;
		this.currentPlayer = currentPlayer;
		this.difficulty = difficulty;
		this.onChangeDifficulty = onChangeDifficulty;
		this.visible = false;
		this.el = document.createElement('div');
		this.el.id = 'tuning-panel';
		this.el.style.cssText = STYLE;
		document.body.appendChild(this.el);

		this._header = document.createElement('div');
		this._header.style.cssText = 'font-weight:bold; margin-bottom:8px;';
		this._header.textContent = 'Tuning (T to toggle)';
		this.el.appendChild(this._header);

		this._body = document.createElement('div');
		this.el.appendChild(this._body);

		this._bindToggle();
	}

	setWorld(world) {
		this.world = world;
		this._rebuild();
	}

	toggle() {
		this.visible = !this.visible;
		this.el.style.display = this.visible ? 'block' : 'none';
	}

	_bindToggle() {
		document.addEventListener('keydown', (e) => {
			if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
			if (e.key === 't' || e.key === 'T') this.toggle();
		});
	}

	updateLiveDebug() {
		if (!this._liveDebug || !this.world?.player) return;
		const p = this.world.player;
		const intent = p.intent ?? {};
		this._liveDebug.textContent =
			`vx ${p.vx.toFixed(2)}  vy ${p.vy.toFixed(2)}  ` +
			`anim ${p.animator.current}  ` +
			`sprint ${intent.sprint ? 'on' : 'off'}  ` +
			`acting ${p.isActing ? 'yes' : 'no'}`;
	}

	_rebuild() {
		this._body.innerHTML = '';
		if (!this.world) return;
		this._liveDebug = document.createElement('div');
		this._liveDebug.style.cssText = 'font-family:monospace; font-size:11px; opacity:0.85; margin-bottom:8px; padding:4px 6px; border:1px dashed #4dff4d;';
		this._liveDebug.textContent = '(live state will appear here)';
		this._body.appendChild(this._liveDebug);
		this._body.appendChild(this._cameraSection());
		this._body.appendChild(this._boundsSection());
		this._body.appendChild(this._playerSection());
		this._body.appendChild(this._attacksSection());
		this._body.appendChild(this._enemySection());
		this._body.appendChild(this._parallaxSection());
		this._body.appendChild(this._soundSection());
		this._body.appendChild(this._actionsSection());
	}

	_section(title, children) {
		const section = document.createElement('div');
		section.style.cssText = SECTION_STYLE;
		const h = document.createElement('div');
		h.style.cssText = HEADING_STYLE;
		h.textContent = title;
		section.appendChild(h);
		for (const c of children) section.appendChild(c);
		return section;
	}

	_slider(label, min, max, step, get, set) {
		const row = document.createElement('div');
		row.style.cssText = 'margin:4px 0;';
		const labelRow = document.createElement('div');
		labelRow.style.cssText = 'display:flex; gap:8px; align-items:center;';
		const name = document.createElement('span');
		name.style.cssText = 'flex:1;';
		name.textContent = label;
		const val = document.createElement('span');
		val.style.cssText = 'width:70px; text-align:right;';
		val.textContent = String(get());
		labelRow.appendChild(name);
		labelRow.appendChild(val);
		row.appendChild(labelRow);
		const input = document.createElement('input');
		input.type = 'range';
		input.min = String(min);
		input.max = String(max);
		input.step = String(step);
		input.value = String(get());
		input.style.cssText = 'width:100%;';
		input.addEventListener('input', (e) => {
			const v = parseFloat(e.target.value);
			set(v);
			val.textContent = String(v);
		});
		row.appendChild(input);
		return row;
	}

	_label(text) {
		const el = document.createElement('div');
		el.style.cssText = SUBLABEL_STYLE;
		el.textContent = text;
		return el;
	}

	_cameraSection() {
		const cam = this.world.camera;
		return this._section('Camera band', [
			this._slider('bandLeft (%)', 0, 1, 0.01, () => cam.bandLeft, (v) => (cam.bandLeft = v)),
			this._slider('bandRight (%)', 0, 1, 0.01, () => cam.bandRight, (v) => (cam.bandRight = v)),
		]);
	}

	_boundsSection() {
		const b = this.world.bounds;
		return this._section('Movement bounds (feetY)', [
			this._slider('topY', 0, this.world.viewportHeight, 1, () => b.topY, (v) => (b.topY = v)),
			this._slider('bottomY', 0, this.world.viewportHeight + 50, 1, () => b.bottomY, (v) => (b.bottomY = v)),
		]);
	}

	_playerSection() {
		const p = this.world.player;
		if (!p) return document.createElement('div');
		return this._section('Player', [
			this._slider('speed', 0, 20, 0.1, () => p.speed, (v) => (p.speed = v)),
			this._slider('max health', 1, 100, 1, () => p.maxHealth, (v) => {
				p.maxHealth = v;
				if (p.health > v) p.health = v;
			}),
			this._slider('spriteCenterOffset', -200, 200, 1, () => p.spriteCenterOffset, (v) => (p.spriteCenterOffset = v)),
		]);
	}

	_attacksSection() {
		const p = this.world.player;
		if (!p) return document.createElement('div');
		const rows = [];
		for (const [name, anim] of Object.entries(p.config.animations)) {
			if (!anim.attack) continue;
			rows.push(this._label(name));
			rows.push(this._slider('width', 0, 1000, 1, () => anim.attack.width, (v) => (anim.attack.width = v)));
			rows.push(this._slider('height', 0, 300, 1, () => anim.attack.height, (v) => (anim.attack.height = v)));
			rows.push(this._slider('damage', 0, 20, 1, () => anim.attack.damage, (v) => (anim.attack.damage = v)));
			rows.push(this._slider('hitFrame', 0, Math.max(0, anim.frames - 1), 1, () => anim.attack.hitFrame, (v) => (anim.attack.hitFrame = v)));
			rows.push(this._slider('rate', 1, 20, 1, () => anim.rate, (v) => (anim.rate = v)));
		}
		return this._section('Player attacks', rows);
	}

	_enemySection() {
		const controllers = this.world.enemyControllers;
		if (!controllers || controllers.length === 0) {
			const empty = document.createElement('div');
			empty.textContent = '(no enemies alive)';
			return this._section('Enemy AI', [empty]);
		}
		const first = controllers[0];
		const applyToAll = (fn) => controllers.forEach(fn);
		return this._section(`Enemy AI (${controllers.length} alive)`, [
			this._slider('detectRange', 0, 2000, 10, () => first.config.detectRange ?? 500, (v) =>
				applyToAll((c) => (c.config.detectRange = v))
			),
			this._slider('stop.x', 0, 500, 1, () => first.config.stop?.x ?? 100, (v) =>
				applyToAll((c) => {
					c.config.stop = c.config.stop || {};
					c.config.stop.x = v;
				})
			),
			this._slider('stop.y', 0, 200, 1, () => first.config.stop?.y ?? 0, (v) =>
				applyToAll((c) => {
					c.config.stop = c.config.stop || {};
					c.config.stop.y = v;
				})
			),
			this._slider('enemy speed', 0, 10, 0.1, () => this.world.enemies[0]?.speed ?? 1, (v) => {
				for (const e of this.world.enemies) e.speed = v;
			}),
			this._slider('enemy health (new spawns)', 1, 50, 1, () => this.world.enemies[0]?.maxHealth ?? 5, (v) => {
				for (const e of this.world.enemies) {
					e.maxHealth = v;
					if (e.health > v) e.health = v;
				}
			}),
		]);
	}

	_soundSection() {
		const children = [];

		children.push(
			this._slider('master volume', 0, 1, 0.01, () => Howler.volume(), (v) => Howler.volume(v))
		);

		const muteRow = document.createElement('label');
		muteRow.style.cssText = 'display:flex; gap:8px; align-items:center; margin:6px 0;';
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = !!Howler._muted;
		checkbox.addEventListener('change', (e) => Howler.mute(e.target.checked));
		const muteLabel = document.createElement('span');
		muteLabel.textContent = 'mute all';
		muteRow.appendChild(checkbox);
		muteRow.appendChild(muteLabel);
		children.push(muteRow);

		const seen = new Set();
		const groups = [];
		const pushGroup = (label, sounds) => {
			if (!sounds) return;
			const entries = Object.entries(sounds).filter(([, h]) => h && !seen.has(h));
			if (entries.length === 0) return;
			entries.forEach(([, h]) => seen.add(h));
			groups.push({ label, entries, sounds });
		};

		if (this.world.player) pushGroup(`Player (${this.world.player.config.name})`, this.world.player.config.sounds);
		const enemyConfigs = new Map();
		for (const e of this.world.enemies) {
			if (!enemyConfigs.has(e.config.name)) enemyConfigs.set(e.config.name, e.config.sounds);
		}
		for (const [name, sounds] of enemyConfigs) pushGroup(`Enemy (${name})`, sounds);

		for (const group of groups) {
			children.push(this._label(group.label));
			for (const [name] of group.entries) {
				children.push(this._soundRow(group.sounds, name));
			}
		}

		return this._section('Sound', children);
	}

	_soundRow(soundsMap, name) {
		const howl = soundsMap[name];
		const row = document.createElement('div');
		row.style.cssText = 'display:flex; gap:6px; align-items:center; margin:3px 0;';

		const label = document.createElement('span');
		label.style.cssText = 'width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';
		label.textContent = name;
		if (getTrim(howl)) label.style.color = '#ffd24d';
		row.appendChild(label);

		const input = document.createElement('input');
		input.type = 'range';
		input.min = '0';
		input.max = '1';
		input.step = '0.01';
		input.value = String(howl.volume());
		input.style.cssText = 'flex:1; min-width:60px;';
		input.addEventListener('input', (e) => howl.volume(parseFloat(e.target.value)));
		row.appendChild(input);

		const play = document.createElement('button');
		play.textContent = '▶';
		play.title = 'play';
		play.style.cssText = 'background:#1a1f1b; color:#4dff4d; border:1px solid #4dff4d; padding:2px 6px; cursor:pointer;';
		play.addEventListener('click', () => howl.play());
		row.appendChild(play);

		const trim = document.createElement('button');
		trim.textContent = '✂';
		trim.title = 'trim audio';
		trim.style.cssText = 'background:#1a1f1b; color:#4dff4d; border:1px solid #4dff4d; padding:2px 6px; cursor:pointer;';
		trim.addEventListener('click', () =>
			openAudioTrimmer({
				howl,
				name,
				onApply: (newHowl) => {
					soundsMap[name] = newHowl;
					this._rebuild();
				},
			})
		);
		row.appendChild(trim);

		return row;
	}

	_parallaxSection() {
		const all = [...this.world.bgLayers, ...this.world.fgLayers];
		if (all.length === 0) return document.createElement('div');
		const rows = all.map((layer) =>
			this._slider(`${layer.id} (x${layer.parallax.toFixed(2)})`, 0, 2, 0.01, () => layer.parallax, (v) => (layer.parallax = v))
		);
		return this._section('Parallax rates', rows);
	}

	_actionsSection() {
		const children = [];

		// Debug overlay toggle (dev-mode hitbox visualization)
		const debugRow = document.createElement('label');
		debugRow.style.cssText = 'display:flex; gap:8px; align-items:center; margin-bottom:8px;';
		const debugCheckbox = document.createElement('input');
		debugCheckbox.type = 'checkbox';
		debugCheckbox.checked = !!this.world?.debugDraw;
		debugCheckbox.addEventListener('change', (e) => {
			if (this.world) this.world.debugDraw = e.target.checked;
		});
		const debugLabel = document.createElement('span');
		debugLabel.textContent = 'Debug overlay (hitboxes, centers, bounds)';
		debugRow.appendChild(debugCheckbox);
		debugRow.appendChild(debugLabel);
		children.push(debugRow);

		if (this.onChangeDifficulty) {
			const diffLabel = document.createElement('div');
			diffLabel.style.cssText = SUBLABEL_STYLE;
			diffLabel.textContent = 'Difficulty';
			children.push(diffLabel);

			const row = document.createElement('div');
			row.style.cssText = 'display:flex; gap:8px; align-items:center; margin-bottom:8px;';
			const input = document.createElement('input');
			input.type = 'range';
			input.min = '1';
			input.max = '10';
			input.step = '1';
			input.value = String(this.difficulty);
			input.style.cssText = 'flex:1;';
			const val = document.createElement('span');
			val.style.cssText = 'width:40px; text-align:right;';
			val.textContent = String(this.difficulty);
			input.addEventListener('input', (e) => {
				const v = parseInt(e.target.value, 10);
				val.textContent = String(v);
				this.difficulty = v;
			});
			input.addEventListener('change', (e) => {
				const v = parseInt(e.target.value, 10);
				this.onChangeDifficulty(v);
			});
			const hint = document.createElement('div');
			hint.style.cssText = 'font-size:10px; opacity:0.6; margin-bottom:6px;';
			hint.textContent = 'Changes apply on next stage reload.';
			row.appendChild(input);
			row.appendChild(val);
			children.push(row);
			children.push(hint);
		}

		if (this.onSelectPlayer && this.characters.length > 0) {
			const label = document.createElement('div');
			label.style.cssText = SUBLABEL_STYLE;
			label.textContent = 'Player character';
			children.push(label);

			const select = document.createElement('select');
			select.style.cssText = 'width:100%; background:#1a1f1b; color:#4dff4d; border:1px solid #4dff4d; padding:4px; margin-bottom:6px; font-family:monospace;';
			for (const name of this.characters) {
				const opt = document.createElement('option');
				opt.value = name;
				opt.textContent = name;
				if (name === this.currentPlayer) opt.selected = true;
				select.appendChild(opt);
			}
			select.addEventListener('change', (e) => this.onSelectPlayer(e.target.value));
			children.push(select);
		}

		if (this.onSelectStage && this.stages.length > 0) {
			const label = document.createElement('div');
			label.style.cssText = SUBLABEL_STYLE;
			label.textContent = 'Stage';
			children.push(label);

			const select = document.createElement('select');
			select.style.cssText = 'width:100%; background:#1a1f1b; color:#4dff4d; border:1px solid #4dff4d; padding:4px; margin-bottom:6px; font-family:monospace;';
			for (let i = 0; i < this.stages.length; i++) {
				const opt = document.createElement('option');
				opt.value = String(i);
				opt.textContent = this.stages[i];
				if (this.stages[i] === this.world.stageName) opt.selected = true;
				select.appendChild(opt);
			}
			select.addEventListener('change', (e) => this.onSelectStage(parseInt(e.target.value, 10)));
			children.push(select);
		}

		const saveAll = document.createElement('button');
		saveAll.textContent = '💾 Save all tuning to disk';
		saveAll.style.cssText = BUTTON_STYLE + 'margin-bottom:6px;';
		saveAll.addEventListener('click', () => this._saveAllToDisk(saveAll));
		children.push(saveAll);

		if (this.onResetStage) {
			const reset = document.createElement('button');
			reset.textContent = 'Reset current stage';
			reset.style.cssText = BUTTON_STYLE;
			reset.addEventListener('click', () => this.onResetStage());
			children.push(reset);
		}
		const copy = document.createElement('button');
		copy.textContent = 'Copy tuned values to clipboard';
		copy.style.cssText = BUTTON_STYLE + 'margin-top:6px;';
		copy.addEventListener('click', () => this._copyJson());
		children.push(copy);

		const status = document.createElement('div');
		status.id = 'tuning-save-status';
		status.style.cssText = 'margin-top:6px; font-size:11px; opacity:0.8; min-height:16px;';
		children.push(status);

		return this._section('Actions', children);
	}

	async _saveAllToDisk(button) {
		const slug = window.__GAME_SLUG__;
		const status = this.el.querySelector('#tuning-save-status');
		if (!slug) {
			if (status) status.textContent = 'No game slug set';
			return;
		}
		if (!this.world) return;
		const originalLabel = button.textContent;
		button.disabled = true;
		button.textContent = 'Saving…';
		if (status) status.textContent = '';
		const written = [];
		try {
			await this._saveGame(slug, written);
			await this._saveStage(slug, written);
			await this._savePlayer(slug, written);
			await this._saveEnemies(slug, written);
			if (status) status.textContent = `✓ Saved: ${written.join(', ')}`;
		} catch (err) {
			if (status) status.textContent = `Save failed: ${err.message}`;
		} finally {
			button.disabled = false;
			button.textContent = originalLabel;
		}
	}

	async _saveGame(slug, written) {
		const cfg = await this._fetchJson(`/src/data/games/${slug}/game.json`);
		cfg.bounds = { topY: this.world.bounds.topY, bottomY: this.world.bounds.bottomY };
		cfg.camera = {
			bandLeft: this.world.camera.bandLeft,
			bandRight: this.world.camera.bandRight,
		};
		await this._post('/_dev/save-game', { gameSlug: slug, config: cfg });
		written.push('game.json');
	}

	async _saveStage(slug, written) {
		const stageName = this.world.stageName;
		if (!stageName) return;
		const cfg = await this._fetchJson(`/src/data/games/${slug}/stages/${stageName}.json`);
		const parallaxById = {};
		for (const l of [...this.world.bgLayers, ...this.world.fgLayers]) parallaxById[l.id] = l.parallax;
		for (const l of cfg.layers ?? []) {
			if (parallaxById[l.id] != null) l.parallax = parallaxById[l.id];
		}
		await this._post('/_dev/save-stage', { gameSlug: slug, stageName, config: cfg });
		written.push(`${stageName}.json`);
	}

	async _savePlayer(slug, written) {
		const p = this.world.player;
		if (!p) return;
		const name = p.config.name;
		const cfg = await this._fetchJson(`/src/data/games/${slug}/characters/${name}.json`);
		cfg.speed = p.speed;
		cfg.health = p.maxHealth;
		cfg.spriteCenterOffset = p.spriteCenterOffset;
		for (const [animName, anim] of Object.entries(cfg.animations ?? {})) {
			const live = p.config.animations[animName];
			if (!live) continue;
			if (typeof live.rate === 'number') anim.rate = live.rate;
			if (anim.attack && live.attack) {
				anim.attack.width = live.attack.width;
				anim.attack.height = live.attack.height;
				anim.attack.damage = live.attack.damage;
				anim.attack.hitFrame = live.attack.hitFrame;
			}
		}
		await this._post('/_dev/save-character', { gameSlug: slug, characterName: name, config: cfg });
		written.push(`${name}.json`);
	}

	async _saveEnemies(slug, written) {
		const seen = new Set();
		for (let i = 0; i < this.world.enemies.length; i++) {
			const e = this.world.enemies[i];
			const ctrl = this.world.enemyControllers[i];
			const name = e.config.name;
			if (seen.has(name)) continue;
			seen.add(name);
			const cfg = await this._fetchJson(`/src/data/games/${slug}/characters/${name}.json`);
			cfg.speed = e.speed;
			cfg.health = e.maxHealth;
			cfg.ai = cfg.ai ?? {};
			if (ctrl?.config) {
				if (typeof ctrl.config.detectRange === 'number') cfg.ai.detectRange = ctrl.config.detectRange;
				if (ctrl.config.stop) {
					cfg.ai.stop = {
						x: ctrl.config.stop.x,
						y: ctrl.config.stop.y,
					};
				}
			}
			await this._post('/_dev/save-character', { gameSlug: slug, characterName: name, config: cfg });
			written.push(`${name}.json`);
		}
	}

	async _fetchJson(url) {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
		return res.json();
	}

	async _post(url, body) {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		if (!res.ok) throw new Error(`${res.status}: ${(await res.text()) || 'request failed'}`);
		return res.json();
	}

	_soundVolumesToJson() {
		const out = { master: Howler.volume(), muted: !!Howler._muted, characters: {} };
		const pushCharacter = (key, sounds) => {
			if (!sounds) return;
			out.characters[key] = Object.fromEntries(Object.entries(sounds).map(([n, h]) => [n, h.volume()]));
		};
		if (this.world.player) pushCharacter(this.world.player.config.name, this.world.player.config.sounds);
		const seen = new Set();
		for (const e of this.world.enemies) {
			if (seen.has(e.config.name)) continue;
			seen.add(e.config.name);
			pushCharacter(e.config.name, e.config.sounds);
		}
		return out;
	}

	_copyJson() {
		const p = this.world.player;
		const cam = this.world.camera;
		const out = {
			camera: { bandLeft: cam.bandLeft, bandRight: cam.bandRight },
			bounds: { topY: this.world.bounds.topY, bottomY: this.world.bounds.bottomY },
			player: p
				? {
						speed: p.speed,
						health: p.maxHealth,
						spriteCenterOffset: p.spriteCenterOffset,
						attacks: Object.fromEntries(
							Object.entries(p.config.animations)
								.filter(([, a]) => a.attack)
								.map(([name, a]) => [
									name,
									{ width: a.attack.width, height: a.attack.height, damage: a.attack.damage, hitFrame: a.attack.hitFrame, rate: a.rate },
								])
						),
					}
				: null,
			enemy: this.world.enemyControllers[0]?.config
				? {
						detectRange: this.world.enemyControllers[0].config.detectRange,
						stop: this.world.enemyControllers[0].config.stop,
					}
				: null,
			parallax: Object.fromEntries([...this.world.bgLayers, ...this.world.fgLayers].map((l) => [l.id, l.parallax])),
			sound: this._soundVolumesToJson(),
		};
		const json = JSON.stringify(out, null, 2);
		if (navigator.clipboard?.writeText) {
			navigator.clipboard.writeText(json);
		} else {
			console.log(json);
		}
	}
}

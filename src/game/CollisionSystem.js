export function findHits(attacker, attack, enemies) {
	const hits = [];
	const cx = attacker.centerX;
	const feetY = attacker.feetY;
	const direction = attacker.direction;
	const dir = direction === 'right' ? 1 : -1;
	const attackWidth = attack.width ?? 150;
	const yRange = attack.height ?? 40;

	for (const e of enemies) {
		if (!e.alive) continue;
		const targetCx = e.centerX;
		const targetFeet = e.feetY;
		const dx = (targetCx - cx) * dir;
		const dy = Math.abs(feetY - targetFeet);
		if (dx >= 0 && dx <= attackWidth && dy <= yRange) {
			hits.push(e);
		}
	}
	return hits;
}

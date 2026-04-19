import { writable } from 'svelte/store';

function currentPath() {
	const hash = window.location.hash.replace(/^#/, '');
	return hash || '/';
}

export const path = writable(currentPath());

window.addEventListener('hashchange', () => {
	path.set(currentPath());
});

export function navigate(to) {
	window.location.hash = to;
}

export function matchRoute(pattern, current) {
	const patternParts = pattern.split('/').filter(Boolean);
	const currentParts = current.split('/').filter(Boolean);
	if (patternParts.length !== currentParts.length) return null;
	const params = {};
	for (let i = 0; i < patternParts.length; i++) {
		if (patternParts[i].startsWith(':')) {
			params[patternParts[i].slice(1)] = decodeURIComponent(currentParts[i]);
		} else if (patternParts[i] !== currentParts[i]) {
			return null;
		}
	}
	return params;
}

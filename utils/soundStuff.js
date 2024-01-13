function createSound(audioSrc) {
	let audio = new Howl({ src: [audioSrc] });
	audio.src = audioSrc;
	return audio;
}

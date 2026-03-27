(() => {
	let pin_interval;

	const detect_interval = setInterval(() => {
		const player = document.getElementById("movie_player");
		if (!player) return;

		clearInterval(detect_interval);

		document.addEventListener('_pin_bottom_update', e => {
			clearInterval(pin_interval);
			if (e.detail) {
				pin_interval = setInterval(() => {
					player.wakeUpControls();
				}, 500);
			}
		});

		document.dispatchEvent(new CustomEvent('_pin_bottom_init'));
	}, 500);
})();
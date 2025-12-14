(() => {
	let player;
	let pin_interval;

	const detect_interval = setInterval(() => {
		player = document.body.querySelector('div#movie_player');
		if (!player) {
			return;
		}

		clearInterval(detect_interval);

		document.addEventListener('_pin_bottom_update', e => {
			clearInterval(pin_interval);
			if (e.detail) {
				pin_interval = setInterval(() => {
					player.wakeUpControls();
				}, 1000);
			}
		});

		document.dispatchEvent(new CustomEvent('_pin_bottom_init'));
	}, 500);
})();
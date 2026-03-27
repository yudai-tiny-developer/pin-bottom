import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(common);
    }
});

function main(common) {
    function loadSettings(initializePin = true) {
        chrome.storage.local.get(common.storage, data => {
            const initial_pin = common.value(data.pin, common.default_pin);
            const space = common.value(data.space, common.default_space);
            const overlays = common.value(data.overlays, common.default_overlays);

            if (initializePin) initial_pin ? on() : off();

            update_space(space);
            update_overlays(overlays);
        });
    }

    function on() {
        current_pin = true;
        player.classList.add('_pin_bottom_button_on');
        pin_button.classList.add('_pin_bottom_button_on');
        document.dispatchEvent(new CustomEvent('_pin_bottom_update', { detail: current_pin }));
    }

    function off() {
        current_pin = false;
        player.classList.remove('_pin_bottom_button_on');
        pin_button.classList.remove('_pin_bottom_button_on');
        document.dispatchEvent(new CustomEvent('_pin_bottom_update', { detail: current_pin }));
    }

    function create_button() {
        const button = document.createElement('button');
        button.classList.add('_pin_bottom_button', 'ytp-button');
        button.innerHTML = '<svg viewBox="0 0 512 512" style="width: 50%; height: 50%;"><g><polygon points="419.286,301.002 416.907,248.852 357.473,219.867 337.487,55.355 369.774,38.438 369.774,0 286.751,0 225.249,0 142.219,0 142.219,38.438 174.509,55.355 154.52,219.867 95.096,248.852 92.714,301.002 256.001,301.002"></polygon><polygon points="231.399,465.871 254.464,512 277.522,465.871 277.522,315.194 231.399,315.194"></polygon></g></svg>';
        button.addEventListener('click', shortcut_command);
        return button;
    }

    function append_button() {
        function append_button_internal() {
            if (common.isEmbed(location.href)) {
                const container = document.getElementsByTagName('player-fullscreen-action-menu')[0]?.querySelector('div.quick-actions-wrapper');
                if (!container) return;

                panel = container;

                if (pin_button.style.width !== '40px') {
                    Object.assign(pin_button.style, {
                        width: '40px',
                        height: '40px',
                    });
                }

                if (!container.contains(pin_button)) {
                    container.appendChild(pin_button);
                }
            } else {
                const area = player.querySelector('div.ytp-right-controls-right');
                if (!area) return;

                panel = player.querySelector('div.ytp-chrome-bottom');
                if (!panel) return;

                if (pin_button.style.width !== undefined) {
                    Object.assign(pin_button.style, {
                        width: undefined,
                        height: undefined,
                    });
                }

                if (!area.contains(pin_button)) {
                    area.appendChild(pin_button);
                }
            }
        }

        clearInterval(append_button_interval);
        append_button_interval = setInterval(append_button_internal, 500);
        append_button_internal();
    }

    function update_space(space) {
        clearInterval(space_interval);
        space_interval = setInterval(() => {
            if (space && current_pin) {
                if (!panel) return;
                if (panel.offsetHeight === 0) return;

                const video = video_instance();
                if (!video) return;
                if (video.style.height.startsWith('calc')) return;

                prev_left = video.style.left;
                prev_width = video.style.width;
                prev_height = video.style.height;

                const offsetHeight = common.isEmbed(location.href) ? panel.offsetHeight * 2 : panel.offsetHeight;
                const space_height = Math.min(Math.max(offsetHeight - (player.offsetHeight - video.offsetHeight) / 2.0, 0), offsetHeight);
                const new_height = video.offsetHeight - space_height;
                const new_width = video.offsetWidth * new_height / video.offsetHeight;
                const new_left = Math.max((player.offsetWidth - new_width) / 2.0, 0);

                Object.assign(video.style, {
                    left: `calc(${new_left}px)`,
                    width: `calc(${new_width}px)`,
                    height: `calc(${new_height}px)`,
                });

                player.classList.add('_pin_bottom_button_space');
            } else {
                if (!prev_height) return;

                const video = video_instance();
                if (!video) return;

                Object.assign(video.style, {
                    left: prev_left,
                    width: prev_width,
                    height: prev_height,
                });

                prev_left = undefined;
                prev_width = undefined;
                prev_height = undefined;

                player.classList.remove('_pin_bottom_button_space');
            }
        }, 250);
    }

    function update_overlays(overlays) {
        if (overlays) {
            player.classList.add('_pin_bottom_hide_overlays');
        } else {
            player.classList.remove('_pin_bottom_hide_overlays');
        }
    }

    function video_instance() {
        if (!video_cache?.parentNode && player) {
            video_cache = player.querySelector('video.html5-main-video');
        }
        return video_cache;
    }

    function shortcut_command() {
        current_pin ? off() : on();
        chrome.storage.local.set({ pin: current_pin });
    }

    const pin_button = create_button();

    let current_pin;
    let prev_left;
    let prev_width;
    let prev_height;
    let player;
    let video_cache;
    let panel;
    let detect_interval;
    let append_button_interval;
    let space_interval;

    document.addEventListener('_pin_bottom_init', () => {
        clearInterval(detect_interval);
        detect_interval = setInterval(() => {
            player = document.getElementById("movie_player");
            if (!player) return;

            clearInterval(detect_interval);

            video_instance();
            append_button();
            chrome.storage.onChanged.addListener(() => loadSettings(false));
            loadSettings(true);
            chrome.runtime.onMessage.addListener(shortcut_command);
        }, 500);
    });

    const s = document.createElement('script');
    s.id = '_pin_bottom';
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}
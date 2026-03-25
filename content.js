import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(common);
    }
});

function main(common) {
    function loadSettings(skip) {
        chrome.storage.local.get(common.storage, data => {
            const initial_pin = common.value(data.pin, common.default_pin);
            const space = common.value(data.space, common.default_space);
            const overlays = common.value(data.overlays, common.default_overlays);

            if (!skip) {
                update_button(initial_pin);
            }

            clearInterval(space_interval);
            space_interval = setInterval(() => {
                if (space && current_pin) {
                    const video = video_instance();
                    if (!video.style.height.startsWith('calc') && panel.offsetHeight > 0) {
                        prev_left = video.style.left;
                        prev_width = video.style.width;
                        prev_height = video.style.height;

                        let offsetHeight;
                        if (video.hasAttribute('playsinline')) { // new-style YouTube embedded player
                            offsetHeight = panel.offsetHeight * 2;
                        } else {
                            offsetHeight = panel.offsetHeight;
                        }

                        const space_height = Math.min(Math.max(offsetHeight - (player.offsetHeight - video.offsetHeight) / 2.0, 0), offsetHeight);
                        const new_height = video.offsetHeight - space_height;
                        const new_width = video.offsetWidth * new_height / video.offsetHeight;
                        const new_left = Math.max((player.offsetWidth - new_width) / 2.0, 0);

                        video.style.left = `calc(${new_left}px)`;
                        video.style.width = `calc(${new_width}px)`;
                        video.style.height = `calc(${new_height}px)`;
                    }

                    player?.classList.add('_pin_bottom_button_space');
                } else {
                    if (prev_height) {
                        const video = video_instance();

                        video.style.left = prev_left;
                        video.style.width = prev_width;
                        video.style.height = prev_height;

                        prev_left = undefined;
                        prev_width = undefined;
                        prev_height = undefined;
                    }

                    player?.classList.remove('_pin_bottom_button_space');
                }
            }, 250);

            if (overlays) {
                player?.classList.add('_pin_bottom_hide_overlays');
            } else {
                player?.classList.remove('_pin_bottom_hide_overlays');
            }
        });
    }

    function update_button(pin) {
        pin ?? common.default_pin ? on() : off();
    }

    function on() {
        current_pin = true;
        player?.classList.add('_pin_bottom_button_on');
        pin_button?.classList.add('_pin_bottom_button_on');
        document.dispatchEvent(new CustomEvent('_pin_bottom_update', { detail: current_pin }));
    }

    function off() {
        current_pin = false;
        player?.classList.remove('_pin_bottom_button_on');
        pin_button?.classList.remove('_pin_bottom_button_on');
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
        if (pin_button) {
            const action_menu = document.getElementsByTagName('player-fullscreen-action-menu')?.[0];
            if (action_menu) { // new-style YouTube embedded player
                pin_button.style.width = '40px';
                pin_button.style.height = '40px';
            } else {
                pin_button.style.width = undefined;
                pin_button.style.height = undefined;
            }
            area.appendChild(pin_button);
        }
    }

    function video_instance() {
        if (!video?.parentNode && player) {
            video = player.querySelector('video.html5-main-video');
        }
        return video;
    }

    const shortcut_command = () => {
        current_pin ? off() : on();
        chrome.storage.local.set({ pin: current_pin });
    };

    let player;
    let video;
    let panel;
    let pin_button;
    let current_pin;
    let prev_left;
    let prev_width;
    let prev_height;
    let space_interval;

    chrome.runtime.onMessage.addListener(shortcut_command);

    document.addEventListener('_pin_bottom_init', () => {
        const detect_interval = setInterval(() => {
            player = document.getElementById("movie_player");
            if (!player) return;

            const action_menu = document.getElementsByTagName('player-fullscreen-action-menu')?.[0];
            if (action_menu) { // new-style YouTube embedded player
                area = action_menu.querySelector('div.quick-actions-wrapper');
                if (!area) return;

                panel = action_menu.querySelector('div.fullscreen-watch-next-entrypoint-wrapper');
                if (!panel) return;
            } else {
                area = player.querySelector('div.ytp-right-controls-left');
                if (!area) return;

                panel = player.querySelector('div.ytp-chrome-bottom');
                if (!panel) return;
            }

            clearInterval(detect_interval);

            pin_button = create_button();
            append_button();

            chrome.storage.onChanged.addListener(() => loadSettings(true));

            loadSettings();
        }, 500);
    });

    const s = document.createElement('script');
    s.id = '_pin_bottom';
    s.src = chrome.runtime.getURL('inject.js');
    s.onload = () => s.remove();
    (document.head || document.documentElement).append(s);
}
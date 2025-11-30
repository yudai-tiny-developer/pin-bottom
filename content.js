import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(document.querySelector('ytd-app') ?? document.body, common);
    }
});

function main(app, common) {
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
                    if (!video.style.height.startsWith('calc') && panel_bottom.offsetHeight > 0) {
                        prev_left = video.style.left;
                        prev_width = video.style.width;
                        prev_height = video.style.height;

                        const space_height = Math.min(Math.max(panel_bottom.offsetHeight - (player.offsetHeight - video.offsetHeight) / 2.0, 0), panel_bottom.offsetHeight) + progress_bar.offsetHeight;
                        const new_height = video.offsetHeight - space_height;
                        const new_width = video.offsetWidth * new_height / video.offsetHeight;
                        const new_left = Math.max((player.offsetWidth - new_width) / 2.0, 0);

                        video.style.left = `calc(${new_left}px)`;
                        video.style.width = `calc(${new_width}px)`;
                        video.style.height = `calc(${new_height}px)`;
                    }

                    gradient_bottom?.classList.add('_pin_bottom_button_space');
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

                    gradient_bottom?.classList.remove('_pin_bottom_button_space');
                }
            }, 250);

            if (overlays) {
                overlays_container?.classList.add('_pin_bottom_hide_overlays');
                gradient_top?.classList.add('_pin_bottom_hide_overlays');
            } else {
                overlays_container?.classList.remove('_pin_bottom_hide_overlays');
                gradient_top?.classList.remove('_pin_bottom_hide_overlays');
            }
        });
    }

    function update_button(pin) {
        pin ?? common.default_pin ? on() : off();
    }

    function on() {
        current_pin = true;

        pin_button.classList.add('_pin_bottom_button_on');
        overlays_container?.classList.add('_pin_bottom_button_on');
        gradient_top?.classList.add('_pin_bottom_button_on');
        panel_bottom?.classList.add('_pin_bottom_button_on');
        gradient_bottom?.classList.add('_pin_bottom_button_on');
        heatmap?.classList.add('_pin_bottom_button_on');

        document.dispatchEvent(new CustomEvent('_pin_bottom_update', { detail: current_pin }));
    }

    function off() {
        current_pin = false;

        pin_button.classList.remove('_pin_bottom_button_on');
        overlays_container?.classList.remove('_pin_bottom_button_on');
        gradient_top?.classList.remove('_pin_bottom_button_on');
        panel_bottom?.classList.remove('_pin_bottom_button_on');
        gradient_bottom?.classList.remove('_pin_bottom_button_on');
        heatmap?.classList.remove('_pin_bottom_button_on');

        document.dispatchEvent(new CustomEvent('_pin_bottom_update', { detail: current_pin }));
    }

    function create_button(new_style) {
        const button = document.createElement('button');
        button.classList.add('_pin_bottom_button', 'ytp-button');
        if (new_style) {
            button.innerHTML = '<svg viewBox="0 0 512 512" style="width: 50%; height: 50%;"><g><polygon points="419.286,301.002 416.907,248.852 357.473,219.867 337.487,55.355 369.774,38.438 369.774,0 286.751,0 225.249,0 142.219,0 142.219,38.438 174.509,55.355 154.52,219.867 95.096,248.852 92.714,301.002 256.001,301.002"></polygon><polygon points="231.399,465.871 254.464,512 277.522,465.871 277.522,315.194 231.399,315.194"></polygon></g></svg>';
        } else {
            button.innerHTML = '<svg viewBox="0 0 512 512" style="width: 100%; height: 100%;" transform="scale(0.5 0.5)"><g><polygon points="419.286,301.002 416.907,248.852 357.473,219.867 337.487,55.355 369.774,38.438 369.774,0 286.751,0 225.249,0 142.219,0 142.219,38.438 174.509,55.355 154.52,219.867 95.096,248.852 92.714,301.002 256.001,301.002"></polygon><polygon points="231.399,465.871 254.464,512 277.522,465.871 277.522,315.194 231.399,315.194"></polygon></g></svg>';
        }
        button.addEventListener('click', shortcut_command);
        return button;
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
    let overlays_container;
    let gradient_top;
    let panel_bottom;
    let progress_bar;
    let gradient_bottom;
    let heatmap;
    let pin_button;
    let current_pin;
    let prev_left;
    let prev_width;
    let prev_height;
    let space_interval;

    chrome.runtime.onMessage.addListener(shortcut_command);

    document.addEventListener('_pin_bottom_init', () => {
        const detect_interval = setInterval(() => {
            player = app.querySelector('div#movie_player');
            if (!player) {
                return;
            }

            let area = player.querySelector('div.ytp-right-controls-left'); // new style
            if (!area) {
                area = player.querySelector('div.ytp-right-controls'); // old style
                if (!area) {
                    return;
                }
            }

            overlays_container = player.querySelector('div.ytp-overlays-container'); // new style
            if (!overlays_container) {
                overlays_container = player.querySelector('div.ytp-show-cards-title'); // old style
                if (!overlays_container) {
                    return;
                }

                gradient_top = player.querySelector('div.ytp-gradient-top'); // old style
                if (!gradient_top) {
                    return;
                }
            }

            panel_bottom = player.querySelector('div.ytp-chrome-bottom');
            if (!panel_bottom) {
                return;
            }

            progress_bar = panel_bottom.querySelector('div.ytp-progress-bar');
            if (!progress_bar) {
                return;
            }

            gradient_bottom = player.querySelector('div.ytp-gradient-bottom');
            if (!gradient_bottom) {
                return;
            }

            heatmap = player.querySelector('div.ytp-heat-map-container');
            if (!heatmap) {
                return;
            }

            clearInterval(detect_interval);

            pin_button = create_button(getComputedStyle(area).display === 'flex');
            area.appendChild(pin_button);

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
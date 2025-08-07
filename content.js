import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(document.querySelector('ytd-app') ?? document.body, common);
    }
});

function main(app, common) {
    function loadSettings(skip) {
        chrome.storage.local.get(common.storage, data => {
            if (!skip) {
                update_button(data.pin);
            }

            clearInterval(space_interval);
            space_interval = setInterval(() => {
                if (data.space && pin) {
                    const video = video_instance();
                    if (!video.style.height.startsWith('calc') && panel_bottom.offsetHeight > 0) {
                        prev_left = video.style.left;
                        prev_width = video.style.width;
                        prev_height = video.style.height;

                        const space_height = Math.min(Math.max(panel_bottom.offsetHeight - (player.offsetHeight - video.offsetHeight) / 2.0, 0), panel_bottom.offsetHeight);
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
        });
    }

    function update_button(pin) {
        pin ?? common.default_pin ? on() : off();
    }

    function on() {
        pin = true;

        pin_button.classList.add('_pin_bottom_button_on');
        panel_top?.classList.add('_pin_bottom_button_on');
        gradient_top?.classList.add('_pin_bottom_button_on');
        panel_bottom?.classList.add('_pin_bottom_button_on');
        gradient_bottom?.classList.add('_pin_bottom_button_on');
        heatmap?.classList.add('_pin_bottom_button_on');

        document.dispatchEvent(new CustomEvent('_pin_bottom_update', { detail: pin }));
    }

    function off() {
        pin = false;

        pin_button.classList.remove('_pin_bottom_button_on');
        panel_top?.classList.remove('_pin_bottom_button_on');
        gradient_top?.classList.remove('_pin_bottom_button_on');
        panel_bottom?.classList.remove('_pin_bottom_button_on');
        gradient_bottom?.classList.remove('_pin_bottom_button_on');
        heatmap?.classList.remove('_pin_bottom_button_on');

        document.dispatchEvent(new CustomEvent('_pin_bottom_update', { detail: pin }));
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
        pin ? off() : on();
        chrome.storage.local.set({ pin: pin });
    };

    let player;
    let video;
    let panel_top;
    let gradient_top;
    let panel_bottom;
    let gradient_bottom;
    let heatmap;
    let pin_button;
    let pin;
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

            const area = player.querySelector('div.ytp-right-controls');
            if (!area) {
                return;
            }

            panel_top = player.querySelector('div.ytp-chrome-top');
            if (!panel_top) {
                return;
            }

            gradient_top = player.querySelector('div.ytp-gradient-top');
            if (!gradient_top) {
                return;
            }

            panel_bottom = player.querySelector('div.ytp-chrome-bottom');
            if (!panel_bottom) {
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
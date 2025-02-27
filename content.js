import(chrome.runtime.getURL('common.js')).then(common => {
    if (!common.isLiveChat(location.href)) {
        main(document.querySelector('ytd-app') ?? document.body, common);
    }
});

function main(app, common) {
    function loadSettings() {
        chrome.storage.local.get(common.storage, data => {
            settings = data;
            update_button();
        });
    }

    function update_button() {
        if (settings) {
            settings.pin ?? common.default_pin ? on() : off();
        }
    }

    function on() {
        pin = true;

        pin_button.classList.add('_pin_bottom_button_on');
        panel_top?.classList.add('_pin_bottom_button_on');
        gradient_top?.classList.add('_pin_bottom_button_on');
        panel_bottom?.classList.add('_pin_bottom_button_on');
        gradient_bottom?.classList.add('_pin_bottom_button_on');
        heatmap?.classList.add('_pin_bottom_button_on');
        fullerscreen_edu?.classList.add('_pin_bottom_button_on');

        clearInterval(pin_interval);

        pin_interval = setInterval(() => {
            player.dispatchEvent((mousemove_event_toggle = !mousemove_event_toggle) ? mousemove0 : mousemove1);
        }, 1000);
    }

    function off() {
        pin = false;

        pin_button.classList.remove('_pin_bottom_button_on');
        panel_top?.classList.remove('_pin_bottom_button_on');
        gradient_top?.classList.remove('_pin_bottom_button_on');
        panel_bottom?.classList.remove('_pin_bottom_button_on');
        gradient_bottom?.classList.remove('_pin_bottom_button_on');
        heatmap?.classList.remove('_pin_bottom_button_on');
        fullerscreen_edu?.classList.remove('_pin_bottom_button_on');

        clearInterval(pin_interval);
    }

    function create_button() {
        const button = document.createElement('button');
        button.classList.add('_pin_bottom_button', 'ytp-button');
        button.innerHTML = '<svg viewBox="0 0 512 512" style="width: 100%; height: 100%;" transform="scale(0.5 0.5)"><g><polygon points="419.286,301.002 416.907,248.852 357.473,219.867 337.487,55.355 369.774,38.438 369.774,0 286.751,0 225.249,0 142.219,0 142.219,38.438 174.509,55.355 154.52,219.867 95.096,248.852 92.714,301.002 256.001,301.002"></polygon><polygon points="231.399,465.871 254.464,512 277.522,465.871 277.522,315.194 231.399,315.194"></polygon></g></svg>';
        button.addEventListener('click', shortcut_command);
        return button;
    }

    const shortcut_command = () => {
        pin ? off() : on();
        chrome.storage.local.set({ pin: pin });
    };

    const pin_button = create_button();

    let settings;
    let player;
    let panel_top;
    let gradient_top;
    let panel_bottom;
    let gradient_bottom;
    let heatmap;
    let fullerscreen_edu;
    let mousemove0;
    let mousemove1;
    let pin;
    let pin_interval;
    let mousemove_event_toggle;

    chrome.runtime.onMessage.addListener(shortcut_command);

    const detect_interval = setInterval(() => {
        player = app.querySelector('div#movie_player');
        if (!player) {
            return false;
        }

        const area = player.querySelector('div.ytp-right-controls');
        if (!area) {
            return false;
        }

        panel_top = player.querySelector('div.ytp-chrome-top');
        if (!panel_top) {
            return false;
        }

        gradient_top = player.querySelector('div.ytp-gradient-top');
        if (!gradient_top) {
            return false;
        }

        panel_bottom = player.querySelector('div.ytp-chrome-bottom');
        if (!panel_bottom) {
            return false;
        }

        gradient_bottom = player.querySelector('div.ytp-gradient-bottom');
        if (!gradient_bottom) {
            return false;
        }

        heatmap = player.querySelector('div.ytp-heat-map-container');
        if (!heatmap) {
            return false;
        }

        clearInterval(detect_interval);

        mousemove0 = new MouseEvent('mousemove', { target: player, clientX: 0 });
        mousemove1 = new MouseEvent('mousemove', { target: player, clientX: 1 });
        fullerscreen_edu = player.querySelector('button.ytp-fullerscreen-edu-button');
        area.appendChild(pin_button);

        loadSettings();
    }, 200);
}
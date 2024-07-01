const app = document.querySelector('ytd-app') ?? document.body;
import(chrome.runtime.getURL('common.js')).then(common => {
    main(common);
});

function main(common) {
    function loadSettings() {
        chrome.storage.local.get(common.storage, data => {
            create_pin(data.pin ?? common.default_pin);
        });
    }

    function create_pin(pin) {
        const controls = app.querySelector('div.ytp-right-controls');
        const button = document.createElement('button');
        button.classList.add('_pin_bottom_button', 'ytp-button');
        button.innerHTML = '<svg viewBox="0 0 512 512" style="margin: 12px; width: 24px; height: 24px;" xml:space="preserve"><g><polygon points="419.286,301.002 416.907,248.852 357.473,219.867 337.487,55.355 369.774,38.438 369.774,0 286.751,0 225.249,0 142.219,0 142.219,38.438 174.509,55.355 154.52,219.867 95.096,248.852 92.714,301.002 256.001,301.002"></polygon><polygon points="231.399,465.871 254.464,512 277.522,465.871 277.522,315.194 231.399,315.194"></polygon></g></svg>';

        const panel_top = app.querySelector('div.ytp-chrome-top');
        const gradient_top = app.querySelector('div.ytp-gradient-top');
        const panel_bottom = app.querySelector('div.ytp-chrome-bottom');
        const gradient_bottom = app.querySelector('div.ytp-gradient-bottom');
        const heatmap = app.querySelector('div.ytp-heat-map-container');
        const fullerscreen_edu = app.querySelector('button.ytp-fullerscreen-edu-button');

        const player = app.querySelector('div#movie_player');
        const mousemove0 = new MouseEvent('mousemove', { target: player, clientX: 0 });
        const mousemove1 = new MouseEvent('mousemove', { target: player, clientX: 1 });

        function on() {
            button.pin = true;

            button.classList.add('_pin_bottom_button_on');
            panel_top?.classList.add('_pin_bottom_button_on');
            gradient_top?.classList.add('_pin_bottom_button_on');
            panel_bottom?.classList.add('_pin_bottom_button_on');
            gradient_bottom?.classList.add('_pin_bottom_button_on');
            heatmap?.classList.add('_pin_bottom_button_on');
            fullerscreen_edu?.classList.add('_pin_bottom_button_on');

            clearInterval(button.pin_id);
            button.pin_id = setInterval(() => {
                player.dispatchEvent((button.mousemove_event_toggle = !button.mousemove_event_toggle) ? mousemove0 : mousemove1);
            }, 500);
        }

        function off() {
            button.pin = false;

            button.classList.remove('_pin_bottom_button_on');
            panel_top?.classList.remove('_pin_bottom_button_on');
            gradient_top?.classList.remove('_pin_bottom_button_on');
            panel_bottom?.classList.remove('_pin_bottom_button_on');
            gradient_bottom?.classList.remove('_pin_bottom_button_on');
            heatmap?.classList.remove('_pin_bottom_button_on');
            fullerscreen_edu?.classList.remove('_pin_bottom_button_on');

            clearInterval(button.pin_id);
        }

        if (pin) {
            on();
        }

        button.addEventListener('click', () => {
            button.pin ? off() : on();
            chrome.storage.local.set({ pin: button.pin });
        });

        controls.appendChild(button);
    }

    new MutationObserver((mutations, observer) => {
        if (app.querySelector('span.ytp-volume-area')) {
            observer.disconnect();
            loadSettings();
        }
    }).observe(app, { childList: true, subtree: true });

}
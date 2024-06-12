const app = document.querySelector('ytd-app');
if (app) {
    import(chrome.runtime.getURL('common.js')).then(common => {
        main(common);
    });
}

function main(common) {
    new MutationObserver((mutations, observer) => {
        if (app.querySelector('span.ytp-volume-area')) {
            observer.disconnect();
            apply_settings();
        }
    }).observe(app, { childList: true, subtree: true });

    function apply_settings() {
        chrome.storage.local.get(common.storage, data => {
            create_pin(data.pin ?? common.default_pin);
        });
    }

    function create_pin(pin) {
        const area = app.querySelector('div.ytp-right-controls');
        const panel = app.querySelector('div.ytp-chrome-bottom');
        const gradient = app.querySelector('div.ytp-gradient-bottom');

        const button = document.createElement('button');
        button.classList.add('_pin_bottom_button', 'ytp-button');
        if (pin) {
            panel.classList.add('_pin_bottom_button_on');
            gradient.classList.add('_pin_bottom_button_on');
            button.classList.add('_pin_bottom_button_on');
        }
        button.pin = pin;
        button.innerHTML = '<svg viewBox="0 0 512 512" style="margin: 12px; width: 24px; height: 24px;" xml:space="preserve"><g><polygon points="419.286,301.002 416.907,248.852 357.473,219.867 337.487,55.355 369.774,38.438 369.774,0 286.751,0 225.249,0 142.219,0 142.219,38.438 174.509,55.355 154.52,219.867 95.096,248.852 92.714,301.002 256.001,301.002"></polygon><polygon points="231.399,465.871 254.464,512 277.522,465.871 277.522,315.194 231.399,315.194"></polygon></g></svg>';
        button.setAttribute('tabindex', '-1');

        button.addEventListener('click', () => {
            if (button.pin) {
                panel.classList.remove('_pin_bottom_button_on');
                gradient.classList.remove('_pin_bottom_button_on');
                button.classList.remove('_pin_bottom_button_on');
                button.pin = false;
            } else {
                panel.classList.add('_pin_bottom_button_on');
                gradient.classList.add('_pin_bottom_button_on');
                button.classList.add('_pin_bottom_button_on');
                button.pin = true;
            }
            chrome.storage.local.set({ pin: button.pin });
            button.blur();
        });

        area.appendChild(button);
    }
}
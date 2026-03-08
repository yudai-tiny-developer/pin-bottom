export const storage = [
    'pin',
    'space',
    'overlays',
];

export const default_pin = false;
export const default_space = false;
export const default_overlays = false;

export function value(value, defaultValue) {
    return value === undefined ? defaultValue : value;
}

export function isLiveChat(url) {
    return url.startsWith('https://www.youtube.com/live_chat?')
        || url.startsWith('https://www.youtube.com/live_chat_replay?')
        ;
}
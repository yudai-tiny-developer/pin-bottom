# Pin YouTube Control

Chrome extension that keeps the YouTube player controls pinned at the bottom of the video.

When pinning is enabled, the extension adds a button to the YouTube player and continuously keeps the control bar visible instead of letting it fade away.

## Features

- Adds a pin button to the YouTube player controls.
- Keeps the bottom control bar visible while pinning is enabled.
- Saves the current pin state with `chrome.storage.local`.
- Optional setting to reserve space for the pinned controls.
- Optional setting to hide overlays in fullscreen mode.
- Supports a keyboard shortcut through the Chrome commands API.
- Includes English and Japanese locale files.

## How It Works

The extension injects a content script on `https://www.youtube.com/*`, adds a custom player button, and toggles CSS classes on YouTube's player UI to keep the controls visible.

It also injects a small page script so it can call YouTube's internal `wakeUpControls()` behavior on an interval while pinning is active.

## Usage

1. Open any YouTube video page.
2. Click the pin button added to the player controls.
3. Open the extension popup to change settings:
   - `Reserve space to display the controls`
   - `Hide overlay in fullscreen mode`

The extension also defines a command named `pin` for toggling the pin state. You can assign or change its shortcut in Chrome's extension shortcut settings.

## License

This project is licensed under dual licenses:
*   [Apache License 2.0](LICENSE-APACHE)
*   [MIT License](LICENSE-MIT)

# Discourse User Notes

A Chrome extension that allows users to take personal, local notes on users in Discourse forums.

## Description

This extension adds a clickable icon next to every username on Discourse forum pages. When clicked, the icon opens a dialog where you can write and save personal notes about that user. All notes are stored locally in your browser and are completely private - only visible to you.

## Features

- **Visual indicators**: Different icons distinguish between users with and without notes
    - 📝 (memo icon) for users without notes
    - 🔖 (bookmark icon) for users who have saved notes
- **Quick note access**: Click any icon to add, edit, or view notes for that user
- **Note management**: View all saved notes alphabetically through the extension popup
- **Complete privacy**: All notes are stored locally on your device
- **Universal compatibility**: Works on any Discourse forum automatically

## Installation

1. Download or clone this project to your computer
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" by toggling the switch in the upper right corner
4. Click the "Load unpacked" button
5. Select the folder containing this extension's files
6. The extension will now appear in your Chrome toolbar

## Usage

1. **Adding notes**: Visit any Discourse forum and click the 📝 icon next to any username
2. **Editing notes**: Click the 🔖 icon next to users who already have notes to edit them
3. **Viewing all notes**: Click the extension icon in Chrome's toolbar to see all your saved notes
4. **Managing notes**: Use the popup window to review or delete notes as needed

## Privacy

This extension operates with complete privacy:

- Notes are stored only on your local device using Chrome's storage API
- No data is transmitted to external servers
- Notes are tied to your Chrome profile and remain private
- Uninstalling the extension will permanently delete all notes

## License

This project is licensed under the MIT License - You can read the full license text [here](/LICENSE.md).

## Technical Requirements

- Google Chrome browser
- Access to Discourse forums (works on any Discourse instance)

***

*Note: This extension requires no special permissions beyond local storage and access to web pages for functionality.*

# harn-weather
Weather generator for the HârnMaster: Roleplaying in the World of Kèthîra rule system as an obsidian.md plugin

## Usage

Select the climate zone and latitude according to the charts in the HârnMaster Keléstia rulebook and set the date you wish to generate the weather for.

To generate the weather, just click one of the buttons or use the commands from the command palette. You can generate the weather for one day, week, month or year per generation step. The current date will be modified accordingly and can be used as a basis for further use.

If you use the buttons, the generation data will be pasted to the clipboard. Executing the commands, will paste the generation data into the active note at the current cursor position.

## Installation
### From Community Plugins

Hopefully coming soon ...

### From GitHub

Download the plugin zip archive (obsidian-harn-weather.zip) from the latest release and extract the plugin folder to your vault's plugins folder: <PATH_TO_VAULT>/.obsidian/plugins/.

**NOTE:** This folder might be invisible on machines running Linux and macOS.

### From source

You will need at least node-18 installed on your machine. If you meet the requirements, run the following commands from a terminal in the source folder:

```
npm install
npm run build
npm run deploy
```

On success, you fill find a newly generated plugin folder obsidian-harn-weather inside the dist folder. Move the obsidian-harn-weather folder to your vault's plugins folder: <PATH_TO_VAULT>/.obsidian/plugins/.

**NOTE:** This folder might be invisible on machines running Linux and macOS.

## Updating

Replace <PATH_TO_VAULT>/.obsidian/plugins/ with the new version.

**NOTE:** The file <PATH_TO_VAULT>/.obsidian/plugins/data.json contains your plugin settings. You might want to keep a backup after updating to a new version.

## Disclaimer

This is unofficial Hârn fan material. Hârn®, HârnWorld®, and HârnMaster® are registered trademarks of Arien Crossby, licensed by Keléstia Productions Ltd (www.kelestia.com).

All related concepts and material are the property of Arien Crossby and Keléstia Productions Ltd (www.kelestia.com). Used with permission.

//////// HEADER ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///   
///   
///   ███▄ ▄███▓ ▄▄▄       ██▀███   ▄████▄      █    ██ ▓█████  ▄▄▄▄   ▓█████  ██▀███   ▄▄▄       ██▓     ██▓    
///   ▓██▒▀█▀ ██▒▒████▄    ▓██ ▒ ██▒▒██▀ ▀█      ██  ▓██▒▓█   ▀ ▓█████▄ ▓█   ▀ ▓██ ▒ ██▒▒████▄    ▓██▒    ▓██▒    
///   ▓██    ▓██░▒██  ▀█▄  ▓██ ░▄█ ▒▒▓█    ▄    ▓██  ▒██░▒███   ▒██▒ ▄██▒███   ▓██ ░▄█ ▒▒██  ▀█▄  ▒██░    ▒██░    
///   ▒██    ▒██ ░██▄▄▄▄██ ▒██▀▀█▄  ▒▓▓▄ ▄██▒   ▓▓█  ░██░▒▓█  ▄ ▒██░█▀  ▒▓█  ▄ ▒██▀▀█▄  ░██▄▄▄▄██ ▒██░    ▒██░    
///   ▒██▒   ░██▒ ▓█   ▓██▒░██▓ ▒██▒▒ ▓███▀ ░   ▒▒█████▓ ░▒████▒░▓█  ▀█▓░▒████▒░██▓ ▒██▒ ▓█   ▓██▒░██████▒░██████▒
///   ░ ▒░   ░  ░ ▒▒   ▓▒█░░ ▒▓ ░▒▓░░ ░▒ ▒  ░   ░▒▓▒ ▒ ▒ ░░ ▒░ ░░▒▓███▀▒░░ ▒░ ░░ ▒▓ ░▒▓░ ▒▒   ▓▒█░░ ▒░▓  ░░ ▒░▓  ░
///   ░  ░      ░  ▒   ▒▒ ░  ░▒ ░ ▒░  ░  ▒      ░░▒░ ░ ░  ░ ░  ░▒░▒   ░  ░ ░  ░  ░▒ ░ ▒░  ▒   ▒▒ ░░ ░ ▒  ░░ ░ ▒  ░
///   ░      ░     ░   ▒     ░░   ░ ░            ░░░ ░ ░    ░    ░    ░    ░     ░░   ░   ░   ▒     ░ ░     ░ ░   
///          ░         ░  ░   ░     ░ ░            ░        ░  ░ ░         ░  ░   ░           ░  ░    ░  ░    ░  ░
///                                 ░                                 ░                                           
///   
//////// DISCLAIMER ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///   
///   This is unofficial Hârn fan material. Hârn®, HârnWorld®, and HârnMaster® are registered trademarks of Arien Crossby, licensed by Keléstia Productions Ltd (www.kelestia.com).
///   All related concepts and material are the property of Arien Crossby and Keléstia Productions Ltd (www.kelestia.com). Used with permission.
///   
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf, WorkspaceContainer, IconName, WorkspaceItem, ButtonComponent, TextComponent, TextAreaComponent, DropdownComponent } from 'obsidian';

let fieldLatitude: DropdownComponent;
let fieldClimateZone: DropdownComponent;
let fieldDay: TextComponent;
let fieldMonth: DropdownComponent;
let fieldYear: TextComponent;
let fieldUnits: DropdownComponent;

//////// TOOLS /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const roll = (sides: number) => Math.floor(Math.random() * sides) + 1;

const zeroPad = (value: number, places: number) => String(value).padStart(places, '0');

const wrap = (value: number, minimum: number, maximum: number, offset: number) => (value - minimum + (offset % maximum) + maximum) % maximum + minimum;

//////// TIME //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const monthName = [ 'Núzyæl', 'Peónu', 'Kelén', 'Nólus', 'Laránè', 'Ágrazhâr', 'Azúra', 'Halánè', 'Savôr', 'Ilvín', 'Návek', 'Morgát' ]

const getTime = (time: number) => (time == -1) ? '-' : `${zeroPad(time, 2)}:00`;

const getTimeSpan = (start: number, end: number, trailing = true) => (start == -1 || end == -1) ? '-' : `${zeroPad(start, 2)}${trailing ? ':00' : ''}-${zeroPad(end, 2)}${trailing ? ':00' : ''}`;

//////// SEASON ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const seasonName = [ 'Spring', 'Summer', 'Autumn', 'Winter' ]

const getSeason = (month: number) => {
	if (month <= 3) {
		return 0;
	}
	else if (month < 6) {
		return 1;
	}
	else if (month < 9) {
		return 2;
	}

	return 3;
}

const getSeasonExact = (day: number, month: number) => {
	if ((month == 10 && day > 15) || month == 11 || month == 0 || (month == 1 && day <= 15)) {
		return 0;
	}
	else if ((month == 1 && day > 15) || month == 2 || month == 3 || (month == 4 && day <= 15)) {
		return 1;
	}
	else if ((month == 4 && day > 15) || month == 5 || month == 6 || (month == 7 && day <= 15)) {
		return 2
	}

	return 3;
}

//////// MOONPHASE /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getMoonPhaseProgress = (day: number) => {
	let fracture = 100 / 15;
	let visibility = 0;
	let phase = 0;

	if (day < 15) {
		visibility = Math.floor((day * fracture));
	}
	else if (day > 15) {
		visibility = Math.floor(100 - ((day - 15) * fracture));
	}

	if (day < 5) {
		return [1, visibility];
	}
	else if (day < 10) {
		return [2, visibility];
	}
	else if (day < 15) {
		return [3, visibility];
	}
	else if (day == 15) {
		return [4, 100];
	}
	else if (day < 20) {
		return [5, visibility];
	}
	else if (day < 25) {
		return [6, visibility];
	}
	else if (day < 30) {
		return [7, visibility];
	}

	return [0, 0];
}

const moonPhaseIcon = [ '🌑︎', '🌒︎', '🌓︎', '🌔︎', '🌕︎', '🌖︎', '🌗︎', '🌘︎' ]

const moonPhaseName = [ 'New', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full', 'Waning crescent', 'Last quarter', 'Waning gibbous' ]

const getMoonPhase = (phase: number, visibility: number) => `${moonPhaseIcon[phase]} (${visibility}%)`

//////// DAYLIGHT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const daylightName = [ 'Night', 'Twilight', 'Day', 'Twilight' ];

const daylightHours = [
	[ '000001122222222222233000', '311122222222222222222233', '000001122222222222233000', '000000001122222233000000' ],
	[ '000000122222222222230000', '000012222222222222222300', '000000122222222222230000', '000000001222222223000000' ],
	[ '000000122222222222230000', '000001222222222222223000', '000000122222222222230000', '000000012222222222300000' ],
	[ '000000022222222222200000', '000000022222222222200000', '000000022222222222200000', '000000022222222222200000' ]
]

const isDay = (latitude: number, season: number, hour: number) => daylightHours[latitude][season][hour + 2] == '2';

const getDaylight = (latitude: number, season: number) => {
	let string = daylightHours[latitude][season];
	let day = [ string.indexOf('2'), string.lastIndexOf('2') ];
	let dayL = (string.match(/2/g) || []).length;
	let dawnL = (string.match(/1/g) || []).length;
	let dawn = [ (dawnL == 0) ? -1 : day[0] - dawnL, (dawnL == 0) ? -1 : day[0] - 1 ];
	let duskL = (string.match(/3/g) || []).length;
	let dusk = [ (duskL == 0) ? -1 : day[1] + 1, (duskL == 0) ? -1 : day[1] + duskL ];
	let nightL = (string.match(/0/g) || []).length;
	let night = [ -1, -1 ];

	if (nightL > 0) {
		if (dawnL == 0) {
			night[1] = day[0] - 1;
		}
		else {
			night[1] = dawn[0] - 1;
		}

		if (duskL == 0) {
			night[0] = day[1] + 1;
		}
		else {
			night[0] = dusk[1] + 1;
		}
	}

	return [ (dawnL == 0) ? -1 : day[0] - dawnL, day[0], day[1], (duskL == 0) ? -1 : day[1] + 1, night[0], night[1] ];
}

//////// WIND //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getActualWindForce = (force: number) => {
	let r = roll(10)

	if (force == 0) {
		if (r <= 4) {
			return 0;
		}
		else if (r <= 8) {
			return 1;
		}

		return 2;
	}
	else if (force == 1) {
		if (r <= 5) {
			return 1;
		}
		else if (r <= 8) {
			return 2;
		}

		return 3;
	}
	else {
		if (r <= 6) {
			return 2;
		}
		else if (r <= 9) {
			return 3;
		}

		return 4;
	}
}

const windDirectionName = [ 'NW', 'N', 'NE', 'SE', 'S', 'SW', 'W' ]

const windForceName = [ 'Calm or light breeze', 'Moderate breeze', 'Strong wind', 'Gale', 'Storm' ]

const windForceValueName = [ [ '0-8 km/h', '8-24 km/h', '24-48 km/h', '48-88 km/h', '>88 km/h' ], [ '0-5 mph', '5-15 mph', '15-30 mph', '30-55 mph', '>55 mph' ] ]

const getWind = (direction: number, force: number, foggy: boolean, units: number) => {
	let wf = !foggy ? getActualWindForce(force) : 0;

	return `${windForceName[wf]} at ${windForceValueName[units][wf]} from ${windDirectionName[direction]}`;
}

//////// WEATHER ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let weatherClimateZoneStart = [ [ 16, 6, 8, 1 ], [ 16, 9, 17, 19 ], [ 7, 15, 17, 19 ], [ 4, 14, 10, 19 ], [ 11, 10, 1, 8 ], [ 8, 6, 8, 9 ], [ 8, 9, 8, 8 ], [ 9, 16, 1, 8 ], [ 3, 3, 1, 8 ], [ 7, 4, 17, 19 ] ];

let weatherChange = [
	[ [ 4, 4, 8, 10, 4, 4, 8, 10, 8, 8, 6, 4, 6, 8, 8, 12, 6, 6, 6, 8, ],  [ 8, 6, 8, 8, 10, 10, 10, 4, 10, 8, 4, 4, 6, 10, 8, 8, 8, 10, 10, 8, ],  [ 8, 6, 4, 8, 10, 10, 8, 10, 4, 8, 4, 4, 6, 6, 6, 6, 10, 4, 8, 8, ],  [ 10, 8, 8, 6, 8, 4, 6, 8, 8, 8, 4, 8, 4, 4, 4, 4, 4, 4, 4, 4,] ],
	[ [ 4, 4, 8, 8, 6, 4, 10, 8, 8, 8, 6, 4, 6, 10, 6, 12, 4, 4, 4, 6, ],  [ 6, 4, 8, 10, 8, 8, 8, 4, 10, 8, 6, 6, 6, 8, 10, 10, 4, 8, 6, 8, ],  [ 8, 6, 6, 6, 10, 8, 4, 8, 6, 6, 4, 4, 8, 4, 6, 8, 10, 6, 6, 8, ],  [ 4, 6, 4, 4, 8, 8, 6, 10, 8, 6, 4, 4, 6, 8, 8, 6, 6, 6, 10, 6,] ],
	[ [ 4, 4, 8, 8, 6, 6, 10, 8, 6, 8, 6, 4, 8, 10, 6, 12, 4, 4, 4, 6, ],  [ 6, 6, 8, 10, 8, 10, 4, 12, 8, 6, 6, 8, 4, 10, 12, 4, 6, 6, 6, 4, ],  [ 8, 6, 6, 8, 8, 8, 8, 8, 4, 6, 4, 4, 8, 4, 8, 6, 10, 6, 6, 8, ],  [ 6, 4, 4, 4, 8, 8, 6, 10, 8, 4, 4, 4, 6, 6, 8, 6, 6, 8, 10, 8,] ],
	[ [ 10, 4, 10, 12, 8, 8, 6, 6, 4, 8, 8, 12, 8, 12, 8, 10, 6, 8, 6, 4, ],  [ 10, 8, 10, 10, 6, 8, 4, 6, 6, 8, 10, 12, 4, 10, 10, 4, 4, 6, 8, 6, ],  [ 8, 8, 8, 6, 4, 8, 10, 8, 12, 10, 10, 4, 8, 6, 4, 6, 8, 10, 10, 8, ],  [ 8, 6, 4, 4, 8, 8, 8, 10, 4, 6, 4, 4, 6, 6, 8, 8, 8, 6, 10, 6,] ],
	[ [ 10, 8, 12, 10, 6, 6, 6, 6, 6, 10, 10, 12, 10, 8, 8, 8, 6, 4, 4, 8, ],  [ 8, 10, 10, 12, 8, 6, 8, 12, 8, 10, 10, 10, 10, 10, 8, 8, 6, 4, 4, 6, ],  [ 10, 8, 12, 10, 6, 6, 6, 4, 10, 10, 10, 8, 10, 10, 10, 8, 6, 4, 4, 6, ],  [ 10, 12, 10, 8, 4, 8, 6, 12, 10, 12, 6, 8, 10, 6, 8, 6, 4, 4, 8, 10,] ],
	[ [ 4, 6, 8, 8, 4, 8, 8, 8, 6, 8, 4, 6, 4, 4, 4, 4, 4, 4, 4, 8, ],  [ 4, 6, 4, 4, 8, 10, 10, 6, 6, 6, 4, 6, 8, 6, 6, 8, 10, 4, 4, 4, ],  [ 8, 4, 8, 4, 4, 8, 8, 8, 8, 8, 4, 6, 4, 4, 4, 4, 4, 4, 6, 6, ],  [ 4, 6, 8, 6, 4, 8, 8, 8, 10, 10, 6, 4, 4, 4, 6, 4, 4, 4, 8, 6,] ],
	[ [ 4, 4, 8, 8, 6, 4, 10, 8, 8, 8, 6, 4, 6, 10, 6, 12, 4, 4, 4, 6, ],  [ 6, 4, 8, 10, 8, 8, 8, 4, 10, 8, 6, 6, 6, 8, 10, 10, 4, 8, 6, 8, ],  [ 8, 6, 6, 6, 10, 8, 4, 8, 6, 6, 4, 4, 8, 4, 6, 8, 10, 6, 6, 8, ],  [ 4, 6, 4, 4, 8, 8, 6, 10, 8, 6, 4, 4, 6, 8, 8, 6, 6, 6, 10, 6,] ],
	[ [ 6, 6, 6, 6, 4, 6, 8, 6, 10, 10, 8, 4, 4, 8, 4, 10, 4, 4, 6, 8, ],  [ 6, 4, 8, 10, 8, 8, 8, 4, 10, 8, 6, 6, 6, 8, 10, 10, 4, 8, 6, 8, ],  [ 10, 8, 8, 4, 8, 6, 6, 6, 8, 8, 4, 4, 6, 4, 4, 6, 8, 8, 4, 10, ],  [ 6, 8, 4, 4, 6, 6, 4, 12, 6, 8, 6, 4, 4, 6, 6, 4, 8, 4, 8, 8,] ],
	[ [ 12, 6, 12, 10, 6, 6, 8, 8, 6, 10, 10, 10, 10, 10, 6, 8, 4, 6, 4, 6, ],  [ 10, 8, 10, 10, 6, 8, 4, 6, 6, 8, 10, 12, 4, 10, 10, 4, 4, 6, 8, 6, ],  [ 12, 8, 12, 10, 4, 4, 6, 4, 8, 10, 10, 8, 12, 10, 4, 6, 8, 6, 6, 8, ],  [ 10, 8, 4, 4, 6, 6, 6, 12, 4, 8, 4, 4, 4, 4, 6, 6, 6, 8, 8, 8,] ],
	[ [ 4, 4, 8, 8, 6, 6, 10, 8, 6, 8, 6, 4, 8, 10, 6, 12, 4, 4, 4, 6, ],  [ 6, 6, 8, 10, 8, 10, 4, 12, 8, 6, 6, 8, 4, 10, 12, 4, 6, 6, 6, 4, ],  [ 8, 6, 6, 8, 8, 8, 8, 8, 4, 6, 4, 4, 8, 4, 8, 6, 10, 6, 6, 8, ],  [ 6, 4, 4, 4, 8, 8, 6, 10, 8, 4, 4, 4, 6, 6, 8, 6, 6, 8, 10, 8,] ]
]

let weatherSubjectiveTemperatureDay = [
	[ [ 4, 3, 2, 3, 4, 4, 4, 3, 4, 5, 4, 3, 2, 2, 2, 3, 3, 4, 4, 4, ],  [ 3, 2, 1, 2, 3, 3, 3, 2, 3, 2, 2, 3, 2, 1, 2, 2, 3, 3, 3, 4, ],  [ 3, 3, 2, 1, 2, 2, 3, 3, 4, 4, 4, 3, 2, 3, 3, 3, 2, 3, 4, 5, ],  [ 4, 5, 5, 4, 5, 4, 3, 4, 4, 4, 4, 5, 4, 4, 3, 2, 3, 3, 4, 4,] ],
	[ [ 4, 3, 2, 2, 3, 4, 4, 3, 4, 5, 4, 3, 2, 1, 2, 3, 3, 3, 4, 4, ],  [ 3, 2, 1, 1, 2, 2, 3, 3, 2, 2, 2, 1, 1, 1, 2, 2, 2, 3, 3, 3, ],  [ 3, 3, 2, 1, 1, 2, 3, 3, 3, 4, 4, 3, 2, 3, 3, 3, 2, 3, 4, 5, ],  [ 4, 5, 4, 3, 2, 3, 3, 4, 3, 4, 4, 5, 3, 3, 3, 3, 4, 4, 4, 4,] ],
	[ [ 3, 3, 2, 2, 3, 4, 3, 3, 4, 3, 4, 3, 2, 1, 2, 3, 3, 3, 3, 3, ],  [ 3, 2, 1, 1, 2, 2, 2, 1, 2, 1, 2, 1, 2, 0, 1, 2, 2, 1, 3, 3, ],  [ 2, 2, 2, 1, 1, 2, 2, 2, 2, 3, 3, 3, 2, 3, 3, 2, 2, 3, 3, 4, ],  [ 4, 4, 4, 3, 3, 3, 3, 3, 2, 3, 3, 4, 3, 3, 3, 3, 4, 4, 4, 3,] ],
	[ [ 2, 2, 2, 2, 2, 1, 3, 2, 2, 2, 2, 2, 2, 2, 1, 2, 3, 2, 2, 3, ],  [ 1, 1, 0, 1, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1, 0, 1, 2, 1, 2, 3, ],  [ 2, 2, 2, 1, 1, 2, 2, 1, 1, 2, 3, 2, 2, 1, 1, 2, 2, 2, 3, 3, ],  [ 3, 3, 3, 2, 3, 2, 3, 2, 2, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 3,] ],
	[ [ 2, 1, 1, 0, 1, 2, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 2, 1, ],  [ 1, 0, 0, 0, 1, 1, 2, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 2, 2, ],  [ 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 2, 0, 0, 0, 0, 0, 1, 2, 2, ],  [ 2, 1, 0, 2, 1, 1, 1, 1, 1, 0, 1, 2, 0, 1, 0, 0, 1, 1, 2, 2,] ],
	[ [ 2, 1, 1, 0, 1, 2, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 2, 1, ],  [ 1, 0, 0, 0, 1, 1, 2, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 2, 2, ],  [ 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 2, 0, 0, 0, 0, 0, 1, 2, 2, ],  [ 2, 1, 0, 2, 1, 1, 1, 1, 1, 0, 1, 2, 0, 1, 0, 0, 1, 1, 2, 2,] ],
	[ [ 4, 3, 2, 2, 3, 4, 5, 3, 4, 5, 5, 4, 2, 1, 2, 3, 3, 3, 4, 4, ],  [ 3, 2, 2, 1, 2, 2, 3, 3, 2, 2, 2, 2, 1, 1, 2, 2, 2, 3, 3, 3, ],  [ 3, 3, 2, 2, 2, 2, 3, 3, 3, 4, 4, 3, 2, 3, 3, 3, 3, 3, 5, 5, ],  [ 5, 5, 4, 3, 3, 3, 3, 4, 3, 4, 4, 5, 4, 3, 4, 3, 5, 4, 4, 4,] ],
	[ [ 4, 3, 2, 2, 3, 4, 4, 3, 4, 5, 4, 3, 2, 1, 2, 3, 3, 3, 4, 4, ],  [ 3, 2, 1, 1, 2, 2, 3, 3, 2, 2, 2, 1, 1, 1, 2, 2, 2, 3, 3, 3, ],  [ 3, 3, 2, 1, 1, 2, 3, 3, 3, 4, 4, 3, 2, 3, 3, 3, 2, 3, 4, 5, ],  [ 4, 5, 4, 3, 2, 3, 3, 4, 3, 4, 4, 5, 3, 3, 3, 3, 4, 4, 4, 4,] ],
	[ [ 2, 2, 2, 2, 2, 1, 3, 2, 2, 2, 2, 2, 2, 2, 1, 2, 3, 2, 2, 3, ],  [ 1, 1, 0, 1, 1, 2, 2, 1, 1, 1, 2, 1, 1, 1, 0, 1, 2, 1, 2, 3, ],  [ 2, 2, 2, 1, 1, 2, 2, 1, 1, 2, 3, 2, 2, 1, 1, 2, 2, 2, 3, 3, ],  [ 3, 3, 3, 2, 3, 2, 3, 2, 2, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 3,] ],
	[ [ 3, 3, 2, 2, 3, 4, 3, 3, 4, 3, 4, 3, 2, 1, 2, 3, 3, 3, 3, 3, ],  [ 3, 2, 1, 1, 2, 2, 2, 1, 2, 1, 2, 1, 2, 0, 1, 2, 2, 1, 3, 3, ],  [ 2, 2, 2, 1, 1, 2, 2, 2, 2, 3, 3, 3, 2, 3, 3, 2, 2, 3, 3, 4, ],  [ 4, 4, 4, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 3,] ]
]

let weatherSubjectiveTemperatureNight = [
	[ [ 5, 4, 3, 3, 4, 5, 5, 4, 5, 5, 5, 5, 3, 3, 3, 4, 4, 5, 5, 4, ],  [ 4, 3, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 3, 3, 2, 3, 3, 3, 4, 4, ],  [ 5, 4, 3, 3, 3, 3, 4, 3, 4, 4, 5, 4, 3, 3, 4, 3, 3, 4, 5, 5, ],  [ 5, 5, 5, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 4, 3, 4, 4, 5, 5,] ],
	[ [ 4, 3, 3, 2, 3, 4, 5, 3, 4, 5, 5, 5, 3, 2, 2, 4, 3, 3, 4, 4, ],  [ 3, 2, 3, 2, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 2, 3, 3, 3, ],  [ 4, 4, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 4, 4, 4, 5, 5, ],  [ 5, 5, 4, 4, 4, 4, 4, 4, 3, 4, 4, 5, 5, 4, 5, 4, 5, 4, 4, 4,] ],
	[ [ 3, 3, 3, 2, 3, 4, 3, 3, 4, 3, 4, 4, 3, 2, 2, 4, 3, 3, 3, 3, ],  [ 3, 2, 3, 2, 2, 3, 2, 1, 2, 2, 3, 3, 2, 2, 1, 2, 2, 2, 3, 3, ],  [ 3, 2, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 4, ],  [ 4, 4, 4, 4, 4, 5, 3, 3, 2, 3, 3, 4, 5, 4, 5, 4, 5, 4, 4, 3,] ],
	[ [ 2, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3, ],  [ 2, 2, 2, 2, 2, 3, 2, 1, 2, 2, 3, 3, 2, 2, 1, 2, 2, 2, 3, 3, ],  [ 3, 2, 2, 3, 2, 3, 2, 2, 2, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3, ],  [ 3, 3, 3, 4, 3, 3, 3, 3, 2, 4, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3,] ],
	[ [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 1, 2, 2, ],  [ 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1, 3, 2, ],  [ 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 3, 2, ],  [ 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 3, 2,] ],
	[ [ 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 1, 2, 2, ],  [ 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1, 3, 2, ],  [ 2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 3, 2, ],  [ 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 3, 2,] ],
	[ [ 5, 4, 4, 3, 4, 5, 5, 4, 5, 5, 5, 5, 4, 3, 3, 5, 4, 4, 5, 5, ],  [ 4, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 4, 3, 4, 4, 4, ],  [ 5, 5, 4, 3, 3, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4, 5, 4, 5, 5, 5, ],  [ 5, 5, 5, 5, 4, 5, 5, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,] ],
	[ [ 4, 3, 3, 2, 3, 4, 5, 3, 4, 5, 5, 5, 3, 2, 2, 4, 3, 3, 4, 4, ],  [ 3, 2, 3, 2, 2, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 2, 3, 3, 3, ],  [ 4, 4, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 3, 3, 3, 4, 4, 4, 5, 5, ],  [ 5, 5, 4, 4, 4, 4, 4, 4, 3, 4, 4, 5, 5, 4, 5, 4, 5, 4, 4, 4,] ],
	[ [ 2, 3, 3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 2, 3, 2, 3, 3, 3, 3, 3, ],  [ 2, 2, 2, 2, 2, 3, 2, 1, 2, 2, 3, 3, 2, 2, 1, 2, 2, 2, 3, 3, ],  [ 3, 2, 2, 3, 2, 3, 2, 2, 2, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3, ],  [ 3, 3, 3, 4, 3, 3, 3, 3, 2, 4, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3,] ],
	[ [ 3, 3, 3, 2, 3, 4, 3, 3, 4, 3, 4, 4, 3, 2, 2, 4, 3, 3, 3, 3, ],  [ 3, 2, 3, 2, 2, 3, 2, 1, 2, 2, 3, 3, 2, 2, 1, 2, 2, 2, 3, 3, ],  [ 3, 2, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3, 4, ],  [ 4, 4, 4, 4, 4, 5, 3, 3, 2, 3, 3, 4, 5, 4, 5, 4, 5, 4, 4, 3,] ]
]

let weatherCloudPrecipitation = [
	[ [ 4, 1, 0, 1, 4, 2, 0, 0, 0, 8, 1, 6, 2, 6, 2, 0, 6, 2, 0, 1, ],  [ 0, 0, 0, 6, 2, 0, 0, 6, 1, 0, 2, 6, 2, 1, 6, 2, 1, 0, 0, 2, ],  [ 1, 6, 2, 0, 8, 6, 0, 3, 4, 1, 0, 1, 2, 2, 6, 6, 0, 2, 3, 1, ],  [ 2, 0, 0, 2, 8, 2, 0, 2, 4, 1, 4, 0, 5, 2, 0, 0, 2, 6, 4, 5,] ],
	[ [ 4, 1, 8, 1, 6, 4, 1, 2, 1, 1, 0, 6, 6, 8, 9, 0, 2, 7, 4, 4, ],  [ 2, 2, 0, 0, 9, 2, 6, 6, 1, 0, 0, 8, 6, 1, 1, 1, 6, 6, 6, 3, ],  [ 8, 2, 8, 2, 8, 9, 7, 6, 3, 1, 4, 6, 1, 7, 6, 1, 0, 1, 4, 1, ],  [ 5, 3, 4, 2, 8, 2, 7, 3, 6, 4, 3, 4, 0, 1, 0, 2, 4, 4, 1, 2,] ],
	[ [ 6, 2, 8, 1, 6, 3, 1, 2, 2, 1, 0, 1, 8, 8, 9, 0, 2, 7, 2, 6, ],  [ 2, 1, 0, 0, 6, 1, 9, 3, 2, 0, 0, 8, 6, 0, 1, 2, 1, 1, 6, 6, ],  [ 8, 2, 8, 8, 6, 9, 3, 6, 7, 3, 6, 6, 1, 7, 3, 2, 0, 1, 6, 1, ],  [ 4, 4, 4, 2, 8, 2, 7, 3, 6, 7, 6, 3, 0, 2, 0, 2, 4, 3, 1, 3,] ],
	[ [ 3, 2, 8, 0, 0, 0, 1, 2, 1, 0, 0, 1, 2, 8, 9, 0, 2, 0, 2, 6, ],  [ 1, 2, 0, 0, 2, 1, 6, 6, 2, 0, 0, 8, 9, 0, 0, 2, 2, 0, 1, 6, ],  [ 8, 2, 8, 8, 2, 2, 1, 2, 1, 0, 1, 2, 0, 0, 9, 0, 0, 1, 6, 1, ],  [ 3, 1, 6, 2, 8, 2, 6, 3, 7, 2, 6, 3, 0, 2, 0, 1, 6, 3, 1, 6,] ],
	[ [ 3, 2, 8, 0, 2, 6, 1, 0, 2, 0, 0, 0, 1, 2, 2, 0, 0, 6, 9, 0, ],  [ 2, 0, 0, 0, 1, 2, 6, 1, 2, 0, 0, 8, 2, 0, 0, 0, 1, 9, 2, 6, ],  [ 0, 2, 0, 8, 2, 2, 3, 2, 0, 0, 1, 2, 0, 0, 0, 0, 1, 9, 2, 6, ],  [ 3, 1, 0, 8, 2, 0, 2, 1, 0, 1, 2, 3, 0, 2, 0, 0, 1, 9, 1, 2,] ],
	[ [ 7, 2, 8, 3, 2, 0, 2, 6, 2, 0, 0, 2, 7, 2, 0, 1, 2, 9, 7, 1, ],  [ 7, 0, 1, 7, 0, 2, 8, 2, 6, 0, 2, 2, 6, 0, 2, 0, 1, 9, 7, 6, ],  [ 1, 2, 8, 7, 2, 0, 2, 6, 2, 0, 2, 1, 2, 0, 2, 2, 6, 9, 7, 6, ],  [ 6, 1, 0, 8, 2, 0, 0, 2, 0, 0, 0, 2, 6, 2, 0, 0, 2, 9, 6, 2,] ],
	[ [ 4, 1, 0, 0, 1, 4, 0, 0, 1, 1, 0, 4, 2, 0, 9, 0, 1, 2, 4, 4, ],  [ 2, 2, 0, 0, 9, 0, 1, 2, 0, 0, 0, 8, 2, 0, 0, 0, 2, 1, 2, 3, ],  [ 8, 2, 8, 1, 0, 9, 6, 1, 1, 1, 4, 2, 0, 2, 1, 0, 0, 0, 3, 1, ],  [ 5, 3, 4, 1, 0, 0, 2, 3, 1, 4, 3, 4, 0, 0, 0, 0, 4, 3, 0, 2,] ],
	[ [ 4, 1, 0, 0, 1, 3, 0, 0, 0, 1, 0, 6, 2, 0, 9, 0, 1, 2, 3, 3, ],  [ 1, 2, 0, 0, 9, 0, 1, 1, 0, 0, 0, 8, 2, 0, 0, 0, 1, 1, 1, 1, ],  [ 0, 1, 8, 1, 0, 9, 2, 1, 0, 1, 4, 2, 0, 2, 1, 0, 0, 0, 3, 0, ],  [ 4, 3, 4, 1, 0, 0, 2, 1, 1, 3, 3, 4, 0, 0, 0, 0, 3, 3, 0, 1,] ],
	[ [ 3, 2, 8, 0, 0, 0, 1, 2, 1, 0, 0, 0, 2, 0, 9, 0, 0, 0, 1, 6, ],  [ 1, 2, 0, 0, 1, 0, 2, 6, 2, 0, 0, 8, 9, 0, 0, 1, 0, 0, 1, 6, ],  [ 8, 2, 8, 0, 0, 1, 1, 1, 1, 0, 1, 2, 0, 0, 9, 0, 0, 0, 6, 1, ],  [ 3, 1, 6, 1, 0, 0, 2, 3, 6, 2, 6, 3, 0, 0, 0, 0, 2, 3, 0, 6,] ],
	[ [ 1, 0, 0, 1, 2, 1, 0, 1, 1, 0, 0, 0, 0, 8, 9, 0, 1, 6, 0, 1, ],  [ 0, 0, 0, 0, 6, 0, 9, 3, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, ],  [ 0, 0, 0, 0, 6, 9, 0, 2, 2, 0, 1, 2, 0, 7, 1, 2, 0, 0, 2, 0, ],  [ 3, 3, 3, 1, 0, 2, 6, 0, 2, 2, 1, 1, 0, 2, 0, 1, 3, 3, 1, 0,] ]
]

let weatherWindDirection = [
	[ [ 1, 2, 3, 5, 0, 0, 5, 5, 0, 1, 1, 2, 3, 4, 4, 5, 5, 5, 0, 0, ],  [ 1, 2, 3, 4, 5, 4, 5, 0, 5, 0, 1, 2, 3, 4, 5, 4, 5, 5, 5, 0, ],  [ 1, 1, 2, 3, 4, 5, 0, 5, 0, 0, 1, 2, 3, 4, 5, 4, 5, 0, 5, 0, ],  [ 1, 0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 2, 2, 3, 4, 5, 4, 5, 5, 0,] ],
	[ [ 1, 2, 0, 4, 5, 0, 5, 5, 0, 1, 1, 2, 3, 4, 4, 5, 3, 5, 0, 0, ],  [ 1, 2, 3, 4, 5, 5, 5, 0, 5, 0, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, ],  [ 1, 1, 2, 3, 4, 5, 0, 5, 0, 1, 2, 3, 3, 4, 5, 4, 5, 0, 5, 0, ],  [ 1, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, 2, 3, 4, 4, 5, 0, 5, 5, 0,] ],
	[ [ 1, 2, 3, 4, 5, 0, 5, 5, 0, 1, 1, 2, 3, 4, 4, 5, 3, 5, 0, 0, ],  [ 2, 1, 2, 3, 4, 5, 3, 4, 5, 0, 1, 2, 2, 3, 4, 5, 0, 1, 0, 1, ],  [ 1, 1, 2, 3, 4, 5, 0, 5, 0, 1, 2, 3, 3, 4, 5, 4, 5, 0, 5, 0, ],  [ 1, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, 2, 3, 4, 4, 5, 0, 5, 5, 0,] ],
	[ [ 2, 1, 2, 3, 4, 5, 0, 1, 0, 1, 2, 3, 2, 3, 3, 4, 4, 5, 5, 0, ],  [ 2, 2, 2, 3, 3, 4, 5, 0, 1, 1, 2, 2, 2, 2, 2, 3, 4, 5, 0, 1, ],  [ 2, 1, 2, 3, 4, 5, 0, 5, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 0, 1, ],  [ 1, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, 2, 3, 4, 4, 5, 5, 0, 5, 0,] ],
	[ [ 2, 2, 2, 3, 3, 4, 5, 0, 1, 1, 2, 2, 2, 2, 2, 3, 4, 5, 0, 1, ],  [ 2, 2, 2, 2, 3, 4, 3, 2, 2, 2, 2, 1, 2, 2, 3, 3, 4, 5, 0, 1, ],  [ 2, 2, 2, 3, 3, 4, 5, 0, 1, 1, 2, 2, 2, 2, 2, 3, 4, 5, 0, 1, ],  [ 2, 1, 2, 3, 4, 5, 0, 1, 0, 1, 2, 3, 2, 3, 3, 4, 4, 5, 0, 1,] ],
	[ [ 2, 1, 2, 2, 3, 4, 5, 0, 1, 2, 3, 2, 3, 4, 3, 3, 4, 5, 0, 1, ],  [ 2, 1, 2, 3, 4, 5, 0, 1, 0, 1, 2, 3, 4, 3, 4, 4, 5, 5, 0, 1, ],  [ 1, 2, 2, 2, 3, 4, 5, 0, 1, 2, 3, 2, 3, 3, 3, 4, 4, 5, 0, 1, ],  [ 2, 2, 2, 3, 3, 4, 5, 0, 1, 1, 2, 2, 2, 3, 2, 3, 4, 5, 0, 1,] ],
	[ [ 1, 2, 3, 4, 5, 0, 5, 5, 0, 1, 1, 2, 3, 4, 4, 5, 3, 5, 0, 0, ],  [ 1, 2, 3, 4, 5, 4, 5, 0, 5, 0, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, ],  [ 1, 1, 2, 3, 4, 5, 0, 5, 0, 1, 2, 3, 3, 4, 5, 4, 5, 0, 5, 0, ],  [ 1, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, 2, 3, 4, 4, 5, 0, 5, 5, 0,] ],
	[ [ 1, 2, 4, 3, 5, 0, 5, 5, 0, 1, 1, 2, 3, 4, 4, 5, 3, 5, 0, 0, ],  [ 1, 2, 3, 4, 5, 4, 5, 0, 5, 0, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, ],  [ 1, 1, 2, 3, 4, 5, 0, 5, 0, 1, 2, 3, 3, 4, 5, 4, 5, 0, 5, 0, ],  [ 1, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, 2, 3, 4, 4, 5, 0, 5, 5, 0,] ],
	[ [ 2, 1, 2, 3, 4, 5, 0, 1, 0, 1, 2, 3, 2, 3, 3, 4, 4, 5, 5, 0, ],  [ 2, 2, 2, 3, 3, 4, 5, 0, 1, 1, 2, 2, 2, 2, 2, 3, 4, 5, 0, 1, ],  [ 2, 1, 2, 3, 4, 5, 0, 5, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 0, 1, ],  [ 1, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, 2, 3, 4, 4, 5, 5, 0, 5, 0,] ],
	[ [ 1, 2, 3, 4, 5, 0, 5, 5, 0, 1, 1, 2, 3, 4, 4, 5, 3, 5, 0, 0, ],  [ 2, 1, 2, 3, 4, 5, 3, 4, 5, 0, 1, 2, 2, 3, 4, 5, 0, 1, 0, 1, ],  [ 1, 1, 2, 3, 4, 5, 0, 5, 0, 1, 2, 3, 3, 4, 5, 4, 5, 0, 5, 0, ],  [ 1, 1, 2, 3, 3, 4, 5, 0, 5, 0, 1, 2, 3, 4, 4, 5, 0, 5, 5, 0,] ]
]

let weatherWindForce = [
	[ [ 1, 1, 0, 1, 2, 2, 2, 1, 1, 0, 1, 1, 0, 0, 0, 0, 2, 2, 2, 1, ],  [ 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 0, 0, 0, 1, 0, 2, 1, 1, 0, ],  [ 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 0, 1, 2, 1, 1, 2, 2, 1, ],  [ 0, 1, 2, 1, 0, 0, 1, 0, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1,] ],
	[ [ 1, 1, 3, 1, 2, 2, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 2, 2, 1, ],  [ 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 0, 0, 0, 0, 1, 2, 1, 1, 0, ],  [ 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 0, 1, 2, 1, 1, 2, 2, 1, ],  [ 0, 1, 2, 1, 0, 0, 1, 0, 1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1,] ],
	[ [ 1, 1, 0, 1, 2, 2, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 2, 2, 1, ],  [ 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, ],  [ 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 0, 1, 2, 1, 1, 2, 2, 1, ],  [ 0, 1, 2, 1, 0, 0, 1, 0, 1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1,] ],
	[ [ 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, ],  [ 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 2, 1, 1, 2, 1, 0, 0, 1, ],  [ 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, 1, ],  [ 0, 1, 1, 1, 0, 0, 1, 0, 2, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1,] ],
	[ [ 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 2, 1, ],  [ 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2, 2, 1, ],  [ 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, ],  [ 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 2, 1, 0,] ],
	[ [ 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 2, 2, 1, ],  [ 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 2, 1, 1, ],  [ 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, ],  [ 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1,] ],
	[ [ 1, 1, 0, 1, 2, 2, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 2, 2, 1, ],  [ 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 0, 0, 0, 0, 1, 2, 1, 1, 0, ],  [ 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 0, 1, 2, 1, 1, 2, 2, 1, ],  [ 0, 1, 2, 1, 0, 0, 1, 0, 1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1,] ],
	[ [ 1, 1, 1, 0, 2, 2, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 2, 2, 1, ],  [ 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 0, 0, 0, 0, 1, 2, 1, 1, 0, ],  [ 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 0, 1, 2, 1, 1, 2, 2, 1, ],  [ 0, 1, 2, 1, 0, 0, 1, 0, 1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1,] ],
	[ [ 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, ],  [ 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 2, 1, 1, 2, 1, 0, 0, 1, ],  [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, 1, ],  [ 0, 1, 1, 1, 0, 0, 1, 0, 2, 0, 2, 2, 1, 1, 1, 2, 1, 1, 1, 0,] ],
	[ [ 1, 1, 0, 1, 2, 2, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 2, 2, 1, ],  [ 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2, 1, 0, 0, 0, ],  [ 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 2, 1, 0, 1, 2, 1, 1, 2, 2, 1, ],  [ 0, 1, 2, 1, 0, 0, 1, 0, 1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1,] ]
]

const getWeatherChange = (index: number, change: number) => {
	let shift = 0;

	switch (roll(change)) {
		case 1:
			shift = 1;
			break;
		case 2:
			shift = -2;
			break;
		case 3:
		case 4:
			shift = -1;
			break;
		default:
			break;
	}

	return wrap(index, 0, 19, shift);
}

//////// TEMPERATURE ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const cloudPrecipitationName = [ "Clear and dry", "Cloudy but dry", "Cloudy with showers", "Overcast but dry", "Overcast with snow or hail showers", "Overcast with continuous snow", "Overcast with showers", "Overcast with continuous rain", "Foggy or misty", "Cloudy with thunderstorm" ]

const getCloudPrecipitation = (cloudPrecipitation : number) => cloudPrecipitationName[cloudPrecipitation];

const subjectiveTemperatureName = [ '**Sweltering**', '**Hot**', 'Warm', 'Cool', 'Cold', '**Freezing**' ]

const subjectiveTemperatureValues = [
	[ '>35°C', '26°C-35°C', '16°C-25°C', '10°C-15°C', '1°C-10°C', '≤0°C' ],
	[ '>95°F', '79°F-95°F', '61°F-77°F', '50°F-59°F', '34°F-50°F', '≤32°F' ]
]

const getSubjectiveTemperature = (temperature: number, units: number) => `${subjectiveTemperatureName[temperature]} at ${subjectiveTemperatureValues[units][temperature]}`;

const getHazard = (temperature: number) => (temperature == 0 || temperature == 1 || temperature == 5) ? ' ⚠' : '';

//////// GENERATOR /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const generateWeather = (settings: HarnWeatherSettings, days: number) => {
	let result = '';
	let day = settings.day;
	let month = settings.month;
	let year = settings.year;
	let season = getSeasonExact(day, month);
	let index = settings.change == -1 ? weatherClimateZoneStart[settings.climateZone][season] : settings.change;

	for (let i = 0; i < days; i++) {
		let moonPhase = getMoonPhaseProgress(day);
		let daylight = getDaylight(settings.latitude, season);
	
		result += `##### ${day} ${monthName[month]} TR${year} (${seasonName[season]})\n`;
		result += `**Dawn: ${getTime(daylight[0])}, Day: ${getTimeSpan(daylight[1], daylight[2])}, Dusk: ${getTime(daylight[3])}, Night: ${getTimeSpan(daylight[4], daylight[5])}, Moon: ${getMoonPhase(moonPhase[0], moonPhase[1])}**\n`;

		for (let w = 0; w < 6; w++) {
			let daylight = isDay(settings.latitude, season, w * 4);
			let subjectiveTemperature = daylight ? weatherSubjectiveTemperatureDay[settings.climateZone][season][index] : weatherSubjectiveTemperatureNight[settings.climateZone][season][index];
			let cloudPrecipitation = weatherCloudPrecipitation[settings.climateZone][season][index];
			let windDirection = weatherWindDirection[settings.climateZone][season][index];
			let windForce = weatherWindForce[settings.climateZone][season][index];
			let foggy = cloudPrecipitation == 8;
		
			result += `- *${getTimeSpan(w * 4, w * 4 + 4)}:* ${getSubjectiveTemperature(subjectiveTemperature, settings.units)}, ${getCloudPrecipitation(cloudPrecipitation)}, ${getWind(windDirection, windForce, foggy, settings.units)}\n`;

			index = getWeatherChange(index, weatherChange[settings.climateZone][season][index]);
		}

		result += '\n';

		day++;

		if (day > 30) {
			day = 1;

			if (month + 1 > 11) {
				month = 0;
				year++;
			}
			else {
				month++;
			}
		}

		season = getSeasonExact(day, month);
	}

	fieldDay.setValue((settings.day = day).toString());
	fieldMonth.setValue((settings.month = month).toString());
	fieldYear.setValue((settings.year = year).toString());

	settings.change = index;

	return result;
}

//////// SETTINGS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface HarnWeatherSettings {
	latitude: number;
	climateZone: number;
	day: number;
	month: number;
	year: number;
	change: number;
	units: number;
}

const DEFAULT_SETTINGS: HarnWeatherSettings = {
	latitude: 1,
	climateZone: 6,
	day: 1,
	month: 0,
	year: 720,
	change: -1,
	units: 0
}

//////// PLUGIN ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default class HarnWeatherPlugin extends Plugin {
	settings: HarnWeatherSettings;

	async onload() {
		this.loadSettings();

		this.registerView(VIEW_TYPE_HARN_WEATHER, (leaf) => new HarnWeatherView(leaf, this));

		const ribbontIconEl = this.addRibbonIcon('cloud-sun', 'Open Hârn weather', () => {
			this.activateView();
		});

		ribbontIconEl.addClass('harn-weather-ribbon-class');

		this.addCommand({
			id: 'harn-generate-day',
			name: 'Get the weather for one day',
			icon: 'cloud-sun',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection(generateWeather(this.settings, 1));
			}
		})

		this.addCommand({
			id: 'harn-generate-week',
			name: 'Get the weather for one week',
			icon: 'cloud-sun',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection(generateWeather(this.settings, 10));
			}
		})

		this.addCommand({
			id: 'harn-generate-month',
			name: 'Get the weather for one month',
			icon: 'cloud-sun',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection(generateWeather(this.settings, 30));
			}
		})

		this.addCommand({
			id: 'harn-generate-year',
			name: 'Get the weather for one year',
			icon: 'cloud-sun',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.replaceSelection(generateWeather(this.settings, 360));
			}
		})
	}

	onunload() {
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;

		const leaves = workspace.getLeavesOfType(VIEW_TYPE_HARN_WEATHER);

		if (leaves.length > 0) {
			leaf = leaves[0];
		}
		else {
			leaf = workspace.getRightLeaf(false);

			await leaf?.setViewState({type: VIEW_TYPE_HARN_WEATHER, active: true});
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

//////// VIEW //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const VIEW_TYPE_HARN_WEATHER = 'harn-weather-view';

export class HarnWeatherView extends ItemView {
	plugin: HarnWeatherPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: HarnWeatherPlugin) {
		super(leaf);

		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_HARN_WEATHER;
	}

	getDisplayText() {
		return 'Hârn Weather';
	}

	getIcon(): IconName {
		return 'cloud-sun';
	}

	async onOpen() {
		new Setting(this.contentEl)
		.setHeading()
		.setName('Location');

		new Setting(this.contentEl)
		.setName('Latitude')
		.setDesc('The latitude to generate the weather for.')
		.addDropdown(dropdown => fieldLatitude = dropdown
			.addOption('0', 'Polar')
			.addOption('1', 'High')
			.addOption('2', 'Mid')
			.addOption('3', 'Low')
			.setValue(this.plugin.settings.latitude.toString())
			.onChange(async value => {
				this.plugin.settings.latitude = clamp(Number(value), 0, 3);

				await this.plugin.saveSettings();
			}));

		new Setting(this.contentEl)
		.setName('Climate Zone')
		.setDesc('The climate zone to generate the weather for.')
		.addDropdown(dropdown => fieldClimateZone = dropdown
			.addOption('0', 'Subpolar')
			.addOption('1', 'Cool Temperate')
			.addOption('2', 'Warm Temperate')
			.addOption('3', 'Subtropical')
			.addOption('4', 'Tropical Arid')
			.addOption('5', 'Tropical Humid')
			.addOption('6', 'Ázadmêre & Hârn')
			.addOption('7', 'Énselet & Shôrkýne')
			.addOption('8', 'Isýnen & Northern Hèpekéria')
			.addOption('9', 'Ubárian & Central Tríerzòn')
			.setValue(this.plugin.settings.climateZone.toString())
			.onChange(async value => {
				this.plugin.settings.climateZone = clamp(Number(value), 0, 9);

				await this.plugin.saveSettings();
			}));
	
		new Setting(this.contentEl)
		.setHeading()
		.setName('Date')

		new Setting(this.contentEl)
		.setName('Day')
		.setDesc('The day in a range from 1 to 30.')
		.addText(text => fieldDay = text
			.setValue(this.plugin.settings.day.toString())
			.onChange(async value => {
				if (!isNaN(Number(value))) {
					this.plugin.settings.day = clamp(Number(value), 1, 30);

					await this.plugin.saveSettings();
				}
				else {
					new Notice('Please specify a valid number.')

					text.setValue(this.plugin.settings.day.toString());
				}
			}));

		new Setting(this.contentEl)
		.setName('Month')
		.setDesc('The month according to the Túzyn Reckoning calendar.')
		.addDropdown(dropdown => fieldMonth = dropdown
			.addOption('0', 'Núzyæl')
			.addOption('1', 'Peónu')
			.addOption('2', 'Kelén')
			.addOption('3', 'Nólus')
			.addOption('4', 'Laránè')
			.addOption('5', 'Ágrazhâr')
			.addOption('6', 'Azúra')
			.addOption('7', 'Halánè')
			.addOption('8', 'Savôr')
			.addOption('9', 'Ilvín')
			.addOption('10', 'Návek')
			.addOption('11', 'Morgát')
			.setValue(this.plugin.settings.month.toString())
			.onChange(async value => {
				this.plugin.settings.month = clamp(Number(value), 0, 11);

				await this.plugin.saveSettings();
			}));

		new Setting(this.contentEl)
		.setName('Year')
		.setDesc('The year according to the Túzyn Reckoning calendar.')
		.addText(text => fieldYear = text
			.setValue(this.plugin.settings.year.toString())
			.onChange(async value => {
				if (!isNaN(Number(value))) {
					this.plugin.settings.year = Number(value);

					await this.plugin.saveSettings();
				}
				else {
					new Notice('Please specify a valid number.')

					text.setValue(this.plugin.settings.year.toString());
				}
			}));

		new Setting(this.contentEl)
		.setHeading()
		.setName('Miscellaneous')

		let inputUnits = new Setting(this.contentEl)
		.setName('Units')
		.setDesc('The units used by temperatures and wind speeds.')
		.addDropdown(dropdown => fieldUnits = dropdown
			.addOption('0', 'Metric')
			.addOption('1', 'Imperial')
			.setValue(this.plugin.settings.units.toString())
			.onChange(async value => {
				this.plugin.settings.units = clamp(Number(value), 0, 1)

				await this.plugin.saveSettings();
			}));

		new Setting(this.contentEl)
		.addButton(button => button
			.setButtonText('Reset')
			.onClick(async () => {
				fieldLatitude.setValue((this.plugin.settings.latitude = DEFAULT_SETTINGS.latitude).toString());
				fieldClimateZone.setValue((this.plugin.settings.climateZone = DEFAULT_SETTINGS.climateZone).toString());
				fieldDay.setValue((this.plugin.settings.day = DEFAULT_SETTINGS.day).toString());
				fieldMonth.setValue((this.plugin.settings.month = DEFAULT_SETTINGS.month).toString());
				fieldYear.setValue((this.plugin.settings.year = DEFAULT_SETTINGS.year).toString());
				
				this.plugin.settings.change = DEFAULT_SETTINGS.change;

				await this.plugin.saveSettings();
			}))
		.addButton(button => button
			.setButtonText('Day')
			.onClick(async () => {
				navigator.clipboard.writeText(generateWeather(this.plugin.settings, 1));
				
				new Notice('The generated Weather for one day has been copied to the clipboard.')

				await this.plugin.saveSettings();
			}))
		.addButton(button => button
			.setButtonText('Week')
			.onClick(async () => {
				navigator.clipboard.writeText(generateWeather(this.plugin.settings, 10));

				new Notice('The generated Weather for one week has been copied to the clipboard.')

				this.plugin.saveSettings();
			}))
		.addButton(button => button
			.setButtonText('Month')
			.onClick(async () => {
				navigator.clipboard.writeText(generateWeather(this.plugin.settings, 30));

				new Notice('The generated Weather for one month has been copied to the clipboard.')

				await this.plugin.saveSettings();
			}))
		.addButton(button => button
			.setButtonText('Year')
			.onClick(async () => {
				navigator.clipboard.writeText(generateWeather(this.plugin.settings, 360));

				new Notice('The generated Weather for one year has been copied to the clipboard.')

				await this.plugin.saveSettings();
			}));
	}

	async onClose() {
	}
}

//////// EOF ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

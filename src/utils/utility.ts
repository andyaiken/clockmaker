import { v4 as uuidv4 } from 'uuid';

export class Utility {
	static guid = (): string => uuidv4();

	static copy = <T>(source: T) => {
		return JSON.parse(JSON.stringify(source)) as T;
	};

	// Adds the item if it's missing, or takes it out if it's there
	static toggle = <T>(items: T[], item: T) => {
		return items.includes(item) ? items.filter(x => x !== item) : [ ...items, item ];
	};

	static remove = <T>(items: T[], item: T) => {
		return items.filter(x => x !== item);
	};

	// A copy of the array in random order (Fisher-Yates)
	static shuffle = <T>(source: T[]) => {
		const result = [ ...source ];
		for (let n = result.length - 1; n > 0; --n) {
			const m = Math.floor(Math.random() * (n + 1));
			[ result[ n ], result[ m ] ] = [ result[ m ], result[ n ] ];
		}
		return result;
	};

	// eg '14:05', in the device's locale
	static formatTime = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	// Saves text or bytes to a file on the user's device
	static download = (filename: string, content: BlobPart, type: string) => {
		const url = URL.createObjectURL(new Blob([ content ], { type: type }));
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.click();
		URL.revokeObjectURL(url);
	};

	// Hands a file to the share sheet (AirDrop, Messages, Files) where the device has one, and downloads it otherwise
	static share = async (filename: string, content: BlobPart, type: string) => {
		const file = new File([ content ], filename, { type: type });
		if (navigator.canShare?.({ files: [ file ] })) {
			try {
				await navigator.share({ files: [ file ], title: filename });
				return;
			} catch (error) {
				// Closing the share sheet isn't a failure
				if ((error as Error).name === 'AbortError') {
					return;
				}
			}
		}
		Utility.download(filename, content, type);
	};

	// A safe file name, eg 'Trouble Brewing' to 'trouble-brewing'
	static toFilename = (name: string, fallback: string) => {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || fallback;
	};
};

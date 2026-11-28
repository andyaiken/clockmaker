import type { ScriptType } from '../enums/script-type';

export interface Script {
	id: string,
	name: string;
	type: ScriptType;
	// True for scripts the user made, copied or imported; only these can be edited
	isHomebrew: boolean;
	author?: string;
	almanac?: string;
	characterIDs: string[];
}

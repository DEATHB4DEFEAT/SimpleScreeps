import { ErrorMapper } from "utils/ErrorMapper";
import { filter } from 'lodash';
import Harvester from './roles/Harvester';

declare global {
	/*
		Example types, expand on these or remove them and add your own.
		Note: Values, properties defined here do no fully *exist* by this type definiton alone.
			You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

		Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
		Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
	*/
	// Memory extension samples
	interface Memory {
		uuid: number;
		log: any;
	}

	interface CreepMemory {
		role: string;
		room: string;
		working: boolean;
	}

	// Syntax for adding proprties to `global` (ex "global.log")
	namespace NodeJS {
		interface Global {
			log: any;
		}
	}
}


const roles = [ { 'key': 'Harvester', 'value': new Harvester() } ]

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
	console.log(`Current game tick is ${Game.time}`);

	for (const name in Memory.creeps) {
		// Automatically delete memory of missing creeps
		if (!(name in Game.creeps))
			delete Memory.creeps[name];

		const creep = Game.creeps[name];

		// Get the role for the creep
		var role = roles.find((role) => role.key == creep.memory.role)?.value;
		if (!role) {
			console.log(`Creep ${creep.name} does not have a role in list [ '${roles.map(r => r.key).join('\', \'')}' ]`)
			continue;
		}

		// Run ticks on the creep
		role.loop(creep);
	}


	// Make sure we have as many creeps as we need per role
	for (const r in roles) {
		// Get all creeps of this kind
		const role = roles[r].value;
		let count = filter(Game.creeps, { memory: { role: roles[r].key } }).length;

		while (count < role.requestedCreeps) {
			const newId = `${role.role}${count + 1}`;

			let code = Game.spawns['Spawn1'].spawnCreep(role.traits, newId);
			if (code < 0)
				console.log(`Failed to spawn creep ${newId} for role ${role.role} at spawn ${'Spawn1'} with code ${code}`);
			if (code == ERR_BUSY)
				continue;

			// Make sure the creep knows its' place
			const newCreep = Game.creeps[newId];
			newCreep.memory.role = role.role;

			count++;
		}
	}
});

import { ErrorMapper } from "utils/ErrorMapper";
import { filter } from 'lodash';
import Harvester from './roles/Harvester';
import Builder from './roles/Builder';
import Distributor from './roles/Distributor';
import Repair from './roles/Repair';



declare global {
	interface Memory {
		uuid: number;
		log: any;
	}

	interface CreepMemory {
		role: string;
		room: string;
		working: boolean;
		target?: Id<any>;
		task?: string;
	}
}


//TODO: Make this dynamic
const roles = [
	{ 'key': 'Builder',		'value': new Builder()		},
	// { 'key': 'Distributor',	'value': new Distributor()	},
	{ 'key': 'Harvester',	'value': new Harvester()	},
	{ 'key': 'Repair',      'value': new Repair()       },
];

let count = 0;


export const loop = ErrorMapper.wrapLoop(() => {
	console.log(`Current game tick is ${Game.time}`);

	for (const name in Memory.creeps) {
		// Automatically delete memory of missing creeps
		if (!(name in Game.creeps))
			delete Memory.creeps[name];
	}

	for (const name in Game.creeps) {
		const creep = Game.creeps[name];

		// Get the role for the creep
		var role = roles.find((role) => role.key == creep.memory.role)?.value;
		if (!role) {
			console.log(`Creep ${creep.name} does not have a role in list [ '${roles.map(r => r.key).join('\', \'')}' ]`);
			continue;
		}

		// Run ticks on the creep
		role.loop(creep);
	}


	// Make sure we have as many creeps as we need per role
	for (const r in roles) {
		// Get all creeps of this kind
		const role = roles[r].value;
		let cur = filter(Game.creeps, { memory: { role: roles[r].key } }).length;

		while (cur < role.requestedCreeps) {
			const newId = `${role.role}${count + 1}`;

			let code = Game.spawns['Spawn1'].spawnCreep(role.traits, newId);
			count++;
			if (code < 0) {
				console.log(`Failed to spawn creep ${newId} for role ${role.role} at spawn ${'Spawn1'} with code ${code}`);
				return;
			}

			// Make sure the creep knows its' place
			const newCreep = Game.creeps[newId];
			newCreep.memory.role = role.role;
			cur++;
		}
	}
});

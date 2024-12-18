import { ErrorMapper } from "utils/ErrorMapper";
import { filter } from 'lodash';
import EnergyHarvester from './roles/Harvesters/EnergyHarvester';
import Builder from './roles/Builder';
import EnergyDistributor from './roles/Distributors/EnergyDistributor';
import Repair from './roles/Repair';
import Melee from './roles/Combat/Melee';



declare global {
	interface Memory {
		uuid: number;
		log: any;
	}

	interface CreepMemory {
		role: string;
		targets: {
			build?: Id<ConstructionSite>;
			container?: Id<StructureContainer>;
			creep?: Id<Creep>;
			repair?: Id<Structure>;
			source?: Id<Source>;
			spawn?: Id<StructureSpawn>;
			spawnExtension?: Id<StructureExtension>;
		}
		task?: string;
	}
}


//TODO: Make this dynamic
const roles = [
	// { 'key': 'EnergyDistributor', 'value': new EnergyDistributor() },
	{ 'key': 'EnergyHarvester', 'value': new EnergyHarvester() },
	{ 'key': 'Builder', 'value': new Builder() },
	// { 'key': 'Repair', 'value': new Repair() },
	{ 'key': 'Melee', 'value': new Melee() },
];

let count = 0;


export const loop = ErrorMapper.wrapLoop(() => {
	console.log(`Current game tick is ${Game.time}`);

	// Automatically delete memory of missing creeps
	for (const name in Memory.creeps)
		if (!(name in Game.creeps))
			delete Memory.creeps[name];

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
		const cur = filter(Game.creeps, { memory: { role: roles[r].key } }).length;

		if (cur < role.requestedCreeps) {
			const newId = `${role.role}${count + 1}`;

			let code = Game.spawns['Spawn1'].spawnCreep(role.traits, newId, { memory: { role: role.role, targets: { } } });
			count++;
			if (code < 0) {
				console.log(`Failed to spawn creep ${newId} for role ${role.role} at spawn ${'Spawn1'} with code ${code}`);
				return;
			}

			return;
		}
	}
});

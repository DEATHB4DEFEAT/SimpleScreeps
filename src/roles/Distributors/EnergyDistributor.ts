import Role from '../../utils/Role';
import { resupplyFromContainer } from '../../utils/Supply';
import Tasks from '../../utils/Tasks';


export default class EnergyDistributor extends Role {
	role: string = 'EnergyDistributor';
	traits: BodyPartConstant[] = [CARRY, CARRY, CARRY, CARRY, MOVE];
	requestedCreeps: number = 1;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		// Figure out what to do
		let ext = undefined;
		if (creep.store.getFreeCapacity() == 0) {
			if (Game.spawns['Spawn1'].store.getFreeCapacity()! > 0)
				creep.memory.task = Tasks.SUPPLY_SPAWN;
			else if ((ext = Game.spawns['Spawn1'].room.find(FIND_MY_STRUCTURES).find(s => s.structureType == STRUCTURE_EXTENSION)))
				creep.memory.task = Tasks.SUPPLY_SPAWN_EXTENSIONS;

			if (creep.memory.task)
				creep.say(creep.memory.task);
		}


		if (creep.memory.task == Tasks.SUPPLY_SPAWN) {
			const code = creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY,
				Math.min(creep.store[RESOURCE_ENERGY], Game.spawns['Spawn1'].store.getFreeCapacity(RESOURCE_ENERGY)));
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(Game.spawns['Spawn1']);
			if (code == ERR_FULL || creep.store[RESOURCE_ENERGY] == 0)
				delete creep.memory.task;
		}

		else if (creep.memory.task == Tasks.SUPPLY_SPAWN_EXTENSIONS) {
			if (!ext) {
				delete creep.memory.task;
				return;
			}

			const code = creep.transfer(ext!, RESOURCE_ENERGY,
				Math.min(creep.store[RESOURCE_ENERGY], (ext as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY)));
			if (code == ERR_INVALID_TARGET) {
				delete creep.memory.task;
				return;
			}
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(ext!);
			if (code == ERR_FULL || creep.store[RESOURCE_ENERGY] == 0)
				delete creep.memory.task;
		}

		// Nothing to do, get energy from storage
		else if (!creep.memory.task && creep.store.getFreeCapacity() > 0)
			resupplyFromContainer(creep, RESOURCE_ENERGY);

		// Invalid
		else if (!creep.memory.task)
			delete creep.memory.task;
	}
}

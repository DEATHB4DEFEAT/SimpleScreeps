import Role from '../utils/Role';
import Tasks from '../utils/Tasks';


export default class Repair extends Role {
	role: string = 'Repair';
	traits: BodyPartConstant[] = [ WORK, WORK, CARRY, MOVE ];
	requestedCreeps: number = 1;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		// Figure out what to do
		const dest = creep.room.find(FIND_STRUCTURES).sort(s => s.hits / s.hitsMax).find(s => s.hits < s.hitsMax);
		if (creep.store.getFreeCapacity() == 0) {
			if (dest)
				creep.memory.task = Tasks.REPAIR;
			else
				creep.memory.task = Tasks.UPGRADE_ROOM;
		}


		// Highest priority
		if (creep.memory.task == Tasks.REPAIR) {
			delete creep.memory.target;
			if (!dest) {
				delete creep.memory.task;
				return;
			}

			const code = creep.repair(dest);
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(dest);
			if (code == ERR_INVALID_TARGET || creep.store[RESOURCE_ENERGY] == 0)
				delete creep.memory.task;
		}

		// Nothing to build, use it on the spawn
		else if (creep.memory.task == Tasks.UPGRADE_ROOM) {
			delete creep.memory.target;

			if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE)
				creep.moveTo(creep.room.controller!);

			if (creep.store[RESOURCE_ENERGY] == 0)
				delete creep.memory.task;
		}

		// Nothing to do, get energy from storage
		else if (!creep.memory.task && creep.store.getFreeCapacity() > 0) {
			const source = creep.memory.target ?? creep.room.find(FIND_STRUCTURES)
				.find(s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0)?.id;
			if (!source) {
				creep.say('NO ENERGY');
				return;
			}

			creep.memory.target = source;
			const sourceBlock = Game.getObjectById(source)!;

			const code = creep.withdraw(sourceBlock, RESOURCE_ENERGY, creep.store.getFreeCapacity());
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(sourceBlock);
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.target;
		}

		// Invalid
		else if (!creep.memory.task)
			delete creep.memory.task;
	}
}

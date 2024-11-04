import Role from '../utils/Role';
import Tasks from '../utils/Tasks';


export default class Builder extends Role {
	role: string = 'Builder';
	traits: BodyPartConstant[] = [ WORK, CARRY, MOVE, MOVE ];
	requestedCreeps: number = 2;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		// Figure out what to do
		const site = Object.values(Game.constructionSites)[0];
		if (site && creep.store.getFreeCapacity() == 0)
			creep.memory.task = Tasks.BUILD;

		if (!creep.memory.task && creep.store.getFreeCapacity() == 0)
			creep.memory.task = Tasks.UPGRADE_ROOM;


		// Highest priority
		if (creep.memory.task == Tasks.BUILD) {
			delete creep.memory.target;

			const code = creep.build(site);
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.task;
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(site);

			if (creep.store[RESOURCE_ENERGY] == 0)
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

		// Nothing yet, get energy from storage
		else if (!creep.memory.task && creep.store.getFreeCapacity() > 0) {
			const source = creep.memory.target ?? creep.room.find(FIND_STRUCTURES)
				.find(s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0)?.id;
			if (!source) {
				creep.say('NO ENERGY');
				return;
			}
			const sourceBlock = Game.getObjectById(source)!;

			const code = creep.withdraw(sourceBlock, RESOURCE_ENERGY, creep.store.getFreeCapacity());
			if (code == ERR_NOT_ENOUGH_RESOURCES)
				creep.memory.task = Tasks.BUILD;
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.target;
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(sourceBlock);
		}

		// Invalid
		else if (!creep.memory.task)
			delete creep.memory.task;
	}
}

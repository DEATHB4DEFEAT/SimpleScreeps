import Role from '../utils/Role';
import Tasks from '../utils/Tasks';


export default class Builder extends Role {
	role: string = 'Builder';
	traits: BodyPartConstant[] = [ WORK, CARRY, MOVE, MOVE ];
	requestedCreeps: number = 4;
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
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(site);
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.task;

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

		// Nothing yet, harvest
		else if (!creep.memory.task && creep.store.getFreeCapacity() > 0) {
			const source = creep.memory.target ?? creep.room.find(FIND_SOURCES)[0].id;
			creep.memory.target = source;
			const sourceBlock = Game.getObjectById(source)!;

			const code = creep.harvest(sourceBlock);
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

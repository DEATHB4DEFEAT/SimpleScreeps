import Role from '../utils/Role';
import { resupplyFromStorage } from '../utils/Supply';
import Tasks from '../utils/Tasks';


export default class Builder extends Role {
	role: string = 'Builder';
	traits: BodyPartConstant[] = [ WORK, WORK, CARRY, MOVE ];
	requestedCreeps: number = 2;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		// Figure out what to do
		const site = Object.values(Game.constructionSites)[0];
		if (creep.store.getFreeCapacity() == 0) {
			if (site)
				creep.memory.task = Tasks.BUILD;
			creep.memory.task ??= Tasks.UPGRADE_ROOM;

			creep.say(creep.memory.task);
		}



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
		else if (!creep.memory.task && creep.store.getFreeCapacity() > 0)
			resupplyFromStorage(creep, RESOURCE_ENERGY);

		// Invalid
		else if (!creep.memory.task)
			delete creep.memory.task;
	}
}

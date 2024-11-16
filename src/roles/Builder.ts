import Role from '../utils/Role';
import { resupplyFromContainer } from '../utils/Supply';
import Tasks from '../utils/Tasks';


export default class Builder extends Role {
	role: string = 'Builder';
	traits: BodyPartConstant[] = [ WORK, CARRY, MOVE, MOVE ];
	requestedCreeps: number = 5;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		// Figure out what to do
		let obj;
		if (creep.memory.targets.build)
			obj = Game.getObjectById(creep.memory.targets.build);

		const site = obj ?? Object.values(Game.constructionSites)[0];
		if (creep.store.getFreeCapacity() == 0) {
			const ol = creep.memory.task;
			if (site)
				creep.memory.task = Tasks.BUILD;
			creep.memory.task ??= Tasks.UPGRADE_ROOM;

			if (ol != creep.memory.task)
				creep.say(creep.memory.task);
		}



		// Highest priority
		if (creep.memory.task == Tasks.BUILD) {
			if (!site) {
				delete creep.memory.task;
				return;
			}
			delete creep.memory.targets.source;

			const code = creep.build(site);
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(site, { visualizePathStyle: { lineStyle: 'solid', stroke: 'brown', opacity: 0.25, } });
			if (code == ERR_INVALID_TARGET) {
				delete creep.memory.targets.build;
				delete creep.memory.task;
			}

			if (creep.store[RESOURCE_ENERGY] == 0)
				delete creep.memory.task;
		}

		// Nothing to build, use it on the spawn
		else if (creep.memory.task == Tasks.UPGRADE_ROOM) {
			delete creep.memory.targets.source;

			if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE)
				creep.moveTo(creep.room.controller!, { visualizePathStyle: { lineStyle: 'dashed', stroke: 'brown', opacity: 0.25, } });

			if (creep.store[RESOURCE_ENERGY] == 0)
				delete creep.memory.task;
		}

		// Nothing yet, get energy from storage
		else if (!creep.memory.task && creep.store.getFreeCapacity() > 0)
			if (!resupplyFromContainer(creep, RESOURCE_ENERGY)) {
				// Harvest since nobody is supplying us
				const source = creep.memory.targets.source ?? creep.room.find(FIND_SOURCES)[0].id;
				creep.memory.targets.source = source;
				const sourceBlock = Game.getObjectById(source)!;

				const code = creep.harvest(sourceBlock)
				if (code == ERR_INVALID_TARGET)
					delete creep.memory.targets.source;
				if (code == ERR_NOT_IN_RANGE)
					creep.moveTo(sourceBlock, { visualizePathStyle: { lineStyle: 'dotted', stroke: 'yellow', opacity: 0.1, } });
			}

		// Invalid
		else if (!creep.memory.task)
			delete creep.memory.task;
	}
}

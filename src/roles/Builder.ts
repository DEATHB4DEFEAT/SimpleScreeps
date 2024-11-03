import Role from '../utils/Role';

export default class Builder extends Role {
	role: string = 'Builder';
	traits: BodyPartConstant[] = [WORK, CARRY, MOVE];
	requestedCreeps: number = 2;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);

		if (!creep.memory.task && creep.store.getFreeCapacity() == 0)
			creep.memory.task = 'upgradeSpawn';

		if (!creep.memory.task && creep.store.getFreeCapacity() > 0) {
			const source = creep.memory.target ?? creep.room.find(FIND_SOURCES)[0].id;
			creep.memory.target = source;
			const sourceBlock = Game.getObjectById(source)!;

			const code = creep.harvest(sourceBlock)
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(sourceBlock);
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.target;
		}
		else {
			delete creep.memory.target;

			if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE)
				creep.moveTo(creep.room.controller!);

			if (creep.store[RESOURCE_ENERGY] == 0)
				delete creep.memory.task;
		}
	}
}

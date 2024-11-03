import Role from '../utils/Role';

export default class Harvester extends Role {
	role: string = 'Harvester';
	traits: BodyPartConstant[] = [WORK, CARRY, MOVE];
	requestedCreeps: number = 3;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);

		if (creep.store.getFreeCapacity() > 0) {
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

			if (creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
				creep.moveTo(Game.spawns['Spawn1']);
		}
	}
}

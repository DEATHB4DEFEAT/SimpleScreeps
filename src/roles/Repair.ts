import Role from '../utils/Role';
import { resupplyFromContainer } from '../utils/Supply';
import Tasks from '../utils/Tasks';


export default class Repair extends Role {
	role: string = 'Repair';
	traits: BodyPartConstant[] = [ WORK, WORK, CARRY, MOVE ];
	requestedCreeps: number = 1;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		// Figure out what to do
		let obj;
		if (creep.memory.targets.repair)
			obj = Game.getObjectById(creep.memory.targets.repair);

		const dest = obj ?? creep.room.find(FIND_STRUCTURES).sort(s => s.hits / s.hitsMax).find(s => s.hits < s.hitsMax);
		if (creep.store.getFreeCapacity() == 0) {
			let ol = creep.memory.task;
			if (dest)
				creep.memory.task = Tasks.REPAIR;
			else
				creep.memory.task = Tasks.SUPPLY_SPAWN;

			if (ol != creep.memory.task)
				creep.say(creep.memory.task);
		}


		// Highest priority
		if (creep.memory.task == Tasks.REPAIR) {
			if (!dest) {
				delete creep.memory.task;
				return;
			}

			const code = creep.repair(dest);
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(dest);
			if (code == ERR_INVALID_TARGET) {
				delete creep.memory.targets.repair;
				delete creep.memory.task;
			}

			if (creep.store[RESOURCE_ENERGY] == 0)
				delete creep.memory.task;
		}

		// Nothing to build, use it on the spawn
		else if (creep.memory.task == Tasks.SUPPLY_SPAWN) {
			delete creep.memory.targets.repair;

			if (creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY,
				Math.min(creep.store[RESOURCE_ENERGY], Game.spawns['Spawn1'].store.getFreeCapacity(RESOURCE_ENERGY))) == ERR_NOT_IN_RANGE)
				creep.moveTo(Game.spawns['Spawn1']);

			if (creep.store[RESOURCE_ENERGY] == 0)
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

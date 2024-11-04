import Role from '../../utils/Role';
import Tasks from '../../utils/Tasks';


export default class EnergyHarvester extends Role {
	role: string = 'EnergyHarvester';
	traits: BodyPartConstant[] = [WORK, CARRY, MOVE, MOVE];
	requestedCreeps: number = 8;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		if (!creep.memory.task) {
			if (creep.store.getFreeCapacity() > 0) {
				creep.memory.task = Tasks.HARVEST;
			}
			else {
				if (creep.store[RESOURCE_ENERGY] > 0)
					creep.memory.task = Tasks.DEPOSIT_ENERGY;
			}

			if (creep.memory.task)
				creep.say(creep.memory.task);
		}


		if (creep.memory.task == Tasks.DEPOSIT_ENERGY && creep.store[RESOURCE_ENERGY] > 0) {
			if (creep.memory.target && (Game.getObjectById(creep.memory.target) as Structure).structureType == STRUCTURE_CONTAINER)
				delete creep.memory.target;

			let structure = creep.memory.target ? Game.getObjectById(creep.memory.target) as StructureContainer : undefined;
			if (!structure) {
				structure = creep.room.find(FIND_STRUCTURES)
					.find(s => s.structureType == STRUCTURE_CONTAINER && s.store.getFreeCapacity() > 0) as StructureContainer;
				if (!structure) {
					creep.memory.task = Tasks.SUPPLY_SPAWN;
					return;
				}
				creep.memory.target = structure.id;
			}

			const code = creep.transfer(structure, RESOURCE_ENERGY);
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(structure);
			if (code == ERR_FULL) {
				creep.memory.task = Tasks.SUPPLY_SPAWN;
				creep.say(creep.memory.task);
			}
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.target;
		}

		else if (creep.memory.task == Tasks.SUPPLY_SPAWN && creep.store[RESOURCE_ENERGY] > 0) {
			delete creep.memory.target;

			const code = creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY);
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(Game.spawns['Spawn1']);
			if (code == ERR_FULL)
				delete creep.memory.task;
		}

		else if (creep.memory.task == Tasks.HARVEST && creep.store.getFreeCapacity() > 0) {
			const source = creep.memory.target ?? creep.room.find(FIND_SOURCES)[0].id;
			creep.memory.target = source;
			const sourceBlock = Game.getObjectById(source);

			const code = creep.harvest(sourceBlock)
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(sourceBlock);
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.target;
		}

		else {
			delete creep.memory.target;
			delete creep.memory.task;
		}
	}
}

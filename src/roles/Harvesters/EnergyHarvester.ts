import Role from '../../utils/Role';
import Tasks from '../../utils/Tasks';


export default class EnergyHarvester extends Role {
	role: string = 'EnergyHarvester';
	traits: BodyPartConstant[] = [ WORK, CARRY, MOVE, MOVE ];
	requestedCreeps: number = 16;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		if (!creep.memory.task) {
			if (creep.store.getFreeCapacity() > 0)
				creep.memory.task = Tasks.HARVEST;
			else if (creep.store[RESOURCE_ENERGY] > 0)
					creep.memory.task = Tasks.SUPPLY_SPAWN;

			if (creep.memory.task)
				creep.say(creep.memory.task, true);
		}


		if (creep.memory.task == Tasks.SUPPLY_SPAWN && creep.store[RESOURCE_ENERGY] > 0) {
			delete creep.memory.targets.source;

			const code = creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY,
				Math.min(creep.store.getUsedCapacity(RESOURCE_ENERGY), Game.spawns['Spawn1'].store.getFreeCapacity(RESOURCE_ENERGY)));
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(Game.spawns['Spawn1'], { visualizePathStyle: { lineStyle: 'dashed', stroke: 'yellow', opacity: 0.1, } });
			if (code == ERR_FULL)
				creep.memory.task = Tasks.DEPOSIT_ENERGY;
		}

		else if (creep.memory.task == Tasks.DEPOSIT_ENERGY && creep.store[RESOURCE_ENERGY] > 0) {
			if (!creep.memory.targets?.container || !Game.getObjectById(creep.memory.targets.container))
				delete creep.memory.targets?.container;
			delete creep.memory.targets.source;

			let structure = creep.memory.targets?.container ? Game.getObjectById(creep.memory.targets.container) as StructureContainer : undefined;
			if (!structure) {
				structure = creep.room.find(FIND_STRUCTURES)
					.find(s => s.structureType == STRUCTURE_CONTAINER && s.store.getFreeCapacity() > 0) as StructureContainer;
				if (!structure) {
					creep.memory.task = Tasks.UPGRADE_ROOM;
					return;
				}
				creep.memory.targets.container = structure.id;
			}

			const code = creep.transfer(structure, RESOURCE_ENERGY,
				Math.min(creep.store.getUsedCapacity(RESOURCE_ENERGY), structure.store.getFreeCapacity(RESOURCE_ENERGY)));
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(structure, { visualizePathStyle: { lineStyle: 'dotted', stroke: 'yellow', opacity: 0.1, } });
			if (code == ERR_FULL) {
				creep.memory.task = Tasks.UPGRADE_ROOM;
				creep.say(creep.memory.task, true);
			}
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.targets.container;
		}

		else if (creep.memory.task == Tasks.UPGRADE_ROOM) {
			delete creep.memory.targets.source;

			if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE)
				creep.moveTo(creep.room.controller!, { visualizePathStyle: { lineStyle: 'dotted', stroke: 'yellow', opacity: 0.1, } });

			if (creep.store[RESOURCE_ENERGY] == 0)
				delete creep.memory.task;
		}

		else if (creep.memory.task == Tasks.HARVEST && creep.store.getFreeCapacity() > 0) {
			const source = creep.memory.targets.source ?? creep.room.find(FIND_SOURCES)[0].id;
			const sourceBlock = Game.getObjectById(source) as Source;
			creep.memory.targets.source = source;

			const code = creep.harvest(sourceBlock)
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(sourceBlock, { visualizePathStyle: { lineStyle: 'solid', stroke: 'yellow', opacity: 0.1, } });
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.targets.source;
		}

		else
			delete creep.memory.task;
	}
}

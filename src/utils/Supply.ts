export function resupplyFromContainer(creep: Creep, resource: ResourceConstant): boolean {
	const source = creep.memory.targets.container ?? creep.room.find(FIND_STRUCTURES)
		.find(s => s.structureType == STRUCTURE_CONTAINER && s.store[resource] > 0)?.id as Id<StructureContainer>;
	if (!source) {
		creep.say('NO ENERGY');
		return false;
	}

	const sourceBlock = Game.getObjectById(source) as StructureContainer;
	if ((sourceBlock as Structure).structureType != STRUCTURE_CONTAINER
		|| sourceBlock.store[RESOURCE_ENERGY] == 0) {
		delete creep.memory.targets.container;
		return false;
	}
	creep.memory.targets.container = source;

	const code = creep.withdraw(sourceBlock, resource,
		Math.min(creep.store.getFreeCapacity(), sourceBlock.store.getUsedCapacity(resource)));
	if (code == ERR_INVALID_TARGET)
		delete creep.memory.targets.container;
	if (code == ERR_NOT_IN_RANGE)
		creep.moveTo(sourceBlock);

	return true;
}

export function resupplyFromContainer(creep: Creep, resource: ResourceConstant): boolean {
	const source = creep.memory.target ?? creep.room.find(FIND_STRUCTURES)
		.find(s => s.structureType == STRUCTURE_CONTAINER && s.store[resource] > 0)?.id;
	if (!source) {
		creep.say('NO ENERGY');
		return false;
	}

	creep.memory.target = source;
	const sourceBlock = Game.getObjectById(source);
	if ((sourceBlock as Structure).structureType != STRUCTURE_STORAGE) {
		if (!(sourceBlock as Source))
			delete creep.memory.target;
		return false;
	}

	const code = creep.withdraw(sourceBlock, resource,
		Math.min(creep.store.getFreeCapacity(), (sourceBlock as StructureStorage).store.getUsedCapacity(resource)));
	if (code == ERR_INVALID_TARGET)
		delete creep.memory.target;
	if (code == ERR_NOT_IN_RANGE)
		creep.moveTo(sourceBlock);

	return true;
}

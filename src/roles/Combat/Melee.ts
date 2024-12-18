import Role from '../../utils/Role';


export default class Melee extends Role {
	role: string = 'Melee';
	traits: BodyPartConstant[] = [ ATTACK, ATTACK, MOVE, MOVE ];
	requestedCreeps: number = 2;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		if (Game.flags['TERMINATE'])
			creep.moveTo(Game.flags['TERMINATE'], { visualizePathStyle: { lineStyle: 'dashed', stroke: 'red', } });
		else
		{
			const enemy = creep.memory.targets.creep ? Game.getObjectById(creep.memory.targets.creep) : creep.room.find(FIND_HOSTILE_CREEPS)[0] ?? creep.room.find(FIND_HOSTILE_POWER_CREEPS)[0] ?? creep.room.find(FIND_HOSTILE_STRUCTURES)[0];
			if (!enemy) {
				if (Game.flags['AWAITERMINATE'])
					creep.moveTo(Game.flags['AWAITERMINATE'], { visualizePathStyle: { lineStyle: 'dotted', stroke: 'orange', }, })
				else
					creep.say('TERMINATED', true)
				return;
			}

			const code = creep.attack(enemy);
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(enemy, { visualizePathStyle: { lineStyle: 'solid', stroke: 'red', }, });
			if (code == ERR_INVALID_TARGET)
				delete creep.memory.targets.creep;

			// const controller = creep.room.controller!;
			// const code = creep.attackController(controller);
			// if (code == ERR_NOT_IN_RANGE)
			// 	creep.moveTo(controller, { visualizePathStyle: { fill: 'red' } });
		}
	}
}

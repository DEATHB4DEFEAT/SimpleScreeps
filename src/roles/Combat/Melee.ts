import Role from '../../utils/Role';


export default class Melee extends Role {
	role: string = 'Melee';
	traits: BodyPartConstant[] = [ ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE ];
	requestedCreeps: number = 1;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);


		if (Game.flags['TERMINATE'])
			creep.moveTo(Game.flags['TERMINATE']);
		else
		{
			// const enemy = creep.room.find(FIND_HOSTILE_STRUCTURES).find(s => s.structureType == STRUCTURE_INVADER_CORE);
			const enemy = creep.room.find(FIND_HOSTILE_CREEPS)[0];
			if (!enemy) {
				creep.say('TERMINATED')
				return;
			}

			const code = creep.attack(enemy);
			if (code == ERR_NOT_IN_RANGE)
				creep.moveTo(enemy, { visualizePathStyle: { fill: 'black' } });

			// const controller = creep.room.controller!;
			// const code = creep.attackController(controller);
			// if (code == ERR_NOT_IN_RANGE)
			// 	creep.moveTo(controller, { visualizePathStyle: { fill: 'black' } });
		}
	}
}

import Role from '../utils/Role';

export default class Harvester extends Role {
	role: string = 'Harvester';
	traits: BodyPartConstant[] = [ WORK, CARRY, MOVE ];
	requestedCreeps: number = 1;
	loop: Function = (creep: Creep) => {
		new Role().loop(creep);

		console.log('harvesterin')
	}
}

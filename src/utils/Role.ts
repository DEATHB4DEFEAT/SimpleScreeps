export default class Role {
	role!: string;
	traits!: BodyPartConstant[];
	requestedCreeps!: number;
	loop: Function = (creep: Creep) => {
		console.log(creep.memory);
	}
}

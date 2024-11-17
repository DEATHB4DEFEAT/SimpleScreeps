export default class Role {
	role!: string;
	traits!: BodyPartConstant[];
	requestedCreeps!: number;
	// types!: {
	// 	creep?: {
	// 		traits: BodyPartConstant[];
	// 		requestedCreeps: number;
	// 	};
	// 	tower?: {

	// 	};
	// };
	loop: Function = (creep: Creep) => {
		// hi
	}
}

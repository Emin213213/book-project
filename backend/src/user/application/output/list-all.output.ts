import {Role} from "@/user/domain/entities/role.entity";

export class ListAllOutput {

    constructor(
        public roles: Role[],
        public total: number,
        public page: number,
        public per_page: number
    ) {
    }


}
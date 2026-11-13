import {Email} from "@/user/domain/value-objects/email.vo";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

export class AuthUser {
    constructor(
        public readonly id: Uuid,
        public readonly email: Email,
    ) {
    }


}
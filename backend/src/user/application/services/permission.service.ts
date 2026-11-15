import {Role} from "@/user/domain/entities/role.entity";
import {Injectable} from "@nestjs/common";

@Injectable()
export class PermissionService {
    constructor() {
    }


    public mapper(role: Role):{
        [key:string]:string[]
    } {

        const permissions = role.permissions.map((permission) => permission.getSlug())

        const modules = {}

        for (const permissionElement of permissions) {
            const [module, permission] = permissionElement.split('.')
            if(!modules.hasOwnProperty(module)) {
                modules[module] = []
            }
            modules[module].push(permission)
        }

        return modules
    }
}
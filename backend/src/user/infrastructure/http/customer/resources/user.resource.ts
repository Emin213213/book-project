import {User} from '../../../../domain/entities/user.entity';
import {Session} from "@/user/domain/entities/session.entity";
import {TokenHasher} from "@/user/application/services/token.hasher";

export class UserResource {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    createdAt: Date;
    updatedAt: Date;

    static make(user: User): UserResource {
        const resource = new UserResource();
        resource.id = user.id;
        resource.firstName = user?.firstName;
        resource.lastName = user?.lastName;
        resource.email = user.email.value;
        resource.createdAt = user.createdAt;
        resource.updatedAt = user.updatedAt;


        return resource;
    }

    // static collection(users: User[]): UserResource[] {
    //
    //     return users.map((user: User) => UserResource.make(user));
    // }



}

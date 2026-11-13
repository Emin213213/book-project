import { NetworkUser } from "@/user/domain/value-objects/network-user.vo";

export abstract class AbstractOauthProvider {

    abstract getProvider(): string;

    abstract generateUrl(): string;

     abstract authenticate(code:string):Promise<NetworkUser>;
}
import {Session} from "@/user/domain/entities/session.entity";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

export class IssuedTokens {
    public readonly accessToken: string;
    public readonly refreshToken: string
    public readonly expiresAt: Date;
    public readonly sessionId: Uuid;

    constructor(accessToken: string, session: Session,refreshToken:string) {
        this.accessToken = accessToken;
        this.expiresAt = session.accessTokenValidUntil;
        this.sessionId = session.id;
        this.refreshToken = refreshToken
    }
}
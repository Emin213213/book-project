import {Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";
import {User} from "@/user/domain/entities/user.entity";

@Entity({name: 'session'})
export class Session {

    public static readonly TOKEN_LIFETIME_MS: number = 24 * 60 * 60 * 1000;

    @PrimaryColumn({
        type: 'varchar',
        length: 36,
        transformer: {
            to: (uuid: Uuid) => uuid.toString(),
            from: (value: string) => value
        },
    })
    id: Uuid;

    @ManyToOne(() => User, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        nullable: false
    })
    @JoinColumn({
        name: 'user_id'
    })
    user: User

    @Column({
        name: 'user_id',
        type: 'varchar',
        length: 36,
    })
    userId: string;


    @Index('UQ_session_refresh_token_hash', { unique: true })
    @Column({
        name: 'refresh_token_hash',
        type: 'char',
        length: 64,
        nullable: true,
    })
    refreshTokenHash: string | null;

    @Column({
        name: 'refresh_expires_at',
        type: 'timestamp',
        nullable: true,
    })
    refreshExpiresAt: Date | null;

    @Column({
        name: 'rotation_count',
        type: 'int',
        unsigned: true,
        default: 0,
    })
    rotationCount: number;

    @Column({
        name: 'revoked_reason',
        type: 'varchar',
        length: 32,
        nullable: true,
    })
    revokedReason: string | null;


    @Index("IDX_session_prev_refresh")
    @Column({
        name: "previous_refresh_token_hash",
        type: "char",
        length: 64,
        nullable: true,
    })
    private previousRefreshTokenHash: string | null = null;

    @Column({
        type: 'timestamp',
        name: 'access_token_valid_until'
    })
    accessTokenValidUntil: Date


    @Column({
        type:'boolean',
        name:"remember_me"
    })
  private  rememberMe:boolean = false

    @Column({
        name: 'access_token',
        type: 'char',
        length: 64,
        unique: true,
    })
    accessToken: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    ip: string | null;


    @Column({
        name: 'user_agent',
        type: 'text',
        nullable: true,
    })
    userAgent: string | null;


    @Column({
        name: 'revoked_at',
        type: 'timestamp',
        nullable: true,
    })
    revokedAt: Date | null;


    @CreateDateColumn({type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt: Date;


    public static create(
        id: Uuid,
        user: User,
        accessToken: string,
        sessionValidUntil: Date
    ) {
        const session = new Session()
        session.id = id
        session.user = user
        session.accessToken = accessToken;
        session.accessTokenValidUntil = sessionValidUntil;

        return session
    }



    public static resolveTokenLifetime(expireAt: number) {
        return new Date(Date.now() + expireAt)
    }


    public revoke(): void {
        this.revokedAt = new Date();
    }

    public isExpired(now: Date): boolean {
        return now.getTime() >= this.accessTokenValidUntil.getTime()
    }


    public rememberClient(ip: string | null, userAgent: string | null): void {
        this.ip = ip;
        this.userAgent = userAgent;
    }
    // =
    public rotateRefreshToken(newRefreshTokenHash: string): void {
        this.previousRefreshTokenHash = this.refreshTokenHash;
        this.refreshTokenHash = newRefreshTokenHash;
        this.rotationCount += 1;
    }


    public renewAccessToken(hash: string, expiresAt: Date): void {
        this.accessToken = hash;
        this.accessTokenValidUntil = expiresAt;
    }

    public initializeRefreshToken(hash: string, expiresAt: Date): void {
        this.refreshTokenHash = hash;
        this.refreshExpiresAt = expiresAt;
        this.rotationCount = 0;
    }

    public canRefresh(now: Date): boolean {
        return this.revokedAt === null
            && this.refreshExpiresAt !== null
            && this.refreshExpiresAt.getTime() > now.getTime();
    }


    public setRememberMe(rememberMe: boolean): void {
        this.rememberMe = rememberMe;
    }


}
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import {Uuid} from '@/common/domain/value-objects/uuid.vo';
import {Email} from '../value-objects/email.vo';
import {Session} from "@/user/domain/entities/session.entity";
import {randomBytes} from "crypto";
import {NetworkUser} from "@/user/domain/value-objects/network-user.vo";
import {Role} from "@/user/domain/entities/role.entity";

@Entity('users')
export class User {
    @PrimaryColumn({
        type: 'varchar',
        length: 36,
    })
    id: string;

    @Column({
        type:"varchar",
        nullable:true
    })
    firstName: string | null;

    @Column({
        type:"varchar",
        nullable:true
    })
    lastName: string | null;


    @Column({
        unique: true,
        type: 'varchar',
        transformer: {
            to: (email: Email) => email.value,
            from: (value: string | Email) =>
                value instanceof Email ? value : new Email(value),
        },
    })
    email: Email;

    @Column({
        type:"varchar",
        nullable:true
    })
    password: string | null;

    @Column({
        name: 'password_reset_token',
        type: 'varchar',
        length: 255,
        nullable: true
    })
    passwordResetToken: string | null

    @Column({
        name:'email_verification_token',
        type:'varchar',
        length:255,
        nullable:true
    })
    emailVerificationToken: string | null

    @Column({
        name:'email_verification_token_expires_at',
        type:'timestamp',
        nullable:true
    })
    emailVerificationTokenExpiresAt: Date | null

    @Column({
        name:'email_verified_at',
        type:'timestamp',
        nullable:true
    })
    emailVerifiedAt: Date | null


    @CreateDateColumn({
        name:'created_at'
    })

    createdAt: Date;

    @UpdateDateColumn({
        name:'updated_at'
    })
    updatedAt: Date;


    @Column({
        name: 'last_login_at',
        type: 'timestamp',
        nullable: true
    })
    lastLoginAt: Date | null = null;

    @Column({ name: 'last_login_ip',
        type: 'varchar',
        length: 45, nullable: true
    })
    lastLoginIp: string | null = null;

    @Column({
        name: 'login_count',
        type: 'int',
        unsigned: true,
        default: 0
    })
    loginCount: number = 0;

    @Column({ name: 'password_changed_at',
        type: 'timestamp',
        nullable: true
    })
    passwordChangedAt: Date | null = null;



    @OneToMany(() => Session, (session) => session.user)
    sessions: Session[]

    @ManyToMany(() => Role)
    @JoinTable({
        name:'user_roles',
        joinColumn:{
            name:'user_id',
            referencedColumnName:'id'
        },
        inverseJoinColumn:{
            name:'role_id',
            referencedColumnName:'id'
        }
    })
    role:Role[]




    public static createUserByEmail(
        email: Email,
        password: string,
        firstName: string,
        lastName: string,
        token:string,
        role:Role[],
        id: Uuid
    ): User {
        const user = new User()
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.password = password
        user.emailVerificationToken = token;
        user.role = role;
        user.id = id.toString();
        return user
    }

    public  static  createByNetwork(
       networkUser:NetworkUser,

    ):User {
        const user = new User()
        user.id = networkUser.id.toString();
        user.email = networkUser.email
        user.emailVerifiedAt = new Date()

        return user
    }


    public static loginByMail(
        email: Email,
        password: string
    ) {
        const user = new User()
        user.email = email;
        user.password = password
        return user
    }


    public generateToken(): this {
        const token = randomBytes(30).toString('base64')
        this.passwordResetToken = token
        return this
    }

    public  generateEmailVerificationToken(ttl:number = 60):this {
        this.emailVerificationToken  = randomBytes(30).toString('base64')

        this.emailVerificationTokenExpiresAt = new Date(Date.now() + ttl * 60 * 1000)

        return  this
    }


    public registerSuccessfulLogin(ip: string | null): void {
        this.lastLoginAt = new Date();
        this.lastLoginIp = ip;
        this.loginCount += 1;
    }


}

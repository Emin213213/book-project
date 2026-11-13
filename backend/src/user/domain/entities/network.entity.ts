    import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from "typeorm";
    import {Uuid} from "@/common/domain/value-objects/uuid.vo";
    import {OauthProviderEnum} from "@/user/domain/enum/oauth-provider.enum";
    import {Email} from "@/user/domain/value-objects/email.vo";
    import {User} from "@/user/domain/entities/user.entity";
    import {NetworkUser} from "@/user/domain/value-objects/network-user.vo";
    
    @Entity({name: 'networks'})
    export  class Network {
    
        @PrimaryColumn({
            type: 'varchar',
            length: 36,
            transformer: {
                to: (uuid: Uuid) => uuid.toString(),
                from: (value: string) => value
            },
        })
        private   id: Uuid;
    
        @Column({
            enum:OauthProviderEnum,
            length:255
        })
        private provider:OauthProviderEnum
    
        @Column({
            length:255,
            nullable:true,
            name:"provider_id"
        })
        private  providerId?:string
    
    
        @Column({
            unique: true,
            type: 'varchar',
            transformer: {
                to: (email: Email) => email.value,
                from: (value: string) => new Email(value),
            },
        })
        email: Email;
    
    
        @Column({
            name:"connected_at",
            nullable:false
        })
        private  connectedAt:Date
    
    
        @ManyToOne(() => User, {
            onDelete: 'CASCADE',
            nullable: false
        })
        @JoinColumn({
            name: 'user_id'
        })
        user: User
    
    
        public  static  createNetwork(user:NetworkUser) {
            const network = new Network();
            network.provider = user.provider;
            network.providerId = user.identity;
            network.email = user.email;
    
            return network
        }
    
        public assignToUser(user:User) {
            this.user  = user
        }
    }
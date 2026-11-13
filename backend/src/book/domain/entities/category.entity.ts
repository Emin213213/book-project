import {BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

@Entity('categories')
export class Category {

    @PrimaryColumn({
        type: 'varchar',
        length: 36,
        transformer: {
            to: (uuid: Uuid) => uuid.toString(),
            from: (value: string | Uuid):Uuid => value instanceof  Uuid? value: Uuid.fromString(value)
        },
    })
    id: Uuid;

    @Column()
    title: string;

    @Column()
    slug: string;


    @CreateDateColumn({name: 'created_at'})
    created_at: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updated_at: Date;


    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = Uuid.generate();
        }
    }

    constructor(title: string, slug: string) {
        this.title = title;
        this.slug = slug;
    }

}
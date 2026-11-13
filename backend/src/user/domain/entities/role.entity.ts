import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { Permission } from "./permission.entity";
import { Uuid } from "@/common/domain/value-objects/uuid.vo";

@Entity("roles")
export class Role {
  @PrimaryColumn({
    type: "varchar",
    length: 36,
  })
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", unique: true })
  slug: string;

  @Column({ type: "boolean", name: "is_system", default: false })
  isSystem: boolean;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: "role_permissions",
    joinColumn: {
      name: "role_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "permission_id",
      referencedColumnName: "id",
    },
  })
  permissions: Permission[];

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt: Date;

  public getId(): Uuid {
    return Uuid.fromString(this.id);
  }

  public static create(
    id: Uuid,
    name: string,
    slug: string,
    isSystem: boolean,
    permissions: readonly Permission[] = [],
  ): Role {
    const role = new Role();
    role.id = id.toString();
    role.name = name;
    role.slug = slug;
    role.isSystem = isSystem;
    role.permissions = [...permissions];

    return role;
  }



}

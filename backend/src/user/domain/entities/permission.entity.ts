import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { Uuid } from "@/common/domain/value-objects/uuid.vo";
import type { PermissionType } from "@/common/domain/permission.type";

/** Разрешение на выполнение конкретного действия в системе. */
@Entity("permissions")
export class Permission {
  @PrimaryColumn({
    type: "varchar",
    length: 36,
  })
  private id: string;

  @Column({ type: "varchar", unique: true })
  private slug: PermissionType;

  @Column({ type: "varchar", length: 255, default: "" })
  private description: string;

  @CreateDateColumn({
    name: "created_at",
  })
  private createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  private updatedAt: Date;

  public getId(): Uuid {
    return Uuid.fromString(this.id);
  }

  public getSlug(): PermissionType {
    return this.slug;
  }

  public getDescription(): string {
    return this.description;
  }

  public changeDescription(description: string): void {
    this.description = description;
  }

  public static create(slug: PermissionType, id: Uuid, description = ""): Permission {
    const permission = new Permission();
    permission.id = id.toString();
    permission.slug = slug;
    permission.description = description;
    return permission;
  }
}

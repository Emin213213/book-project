import {Permission} from '@/user/domain/entities/permission.entity';

import type {IPermissionRepository} from '@/user/domain/repositories/permission.repository.interface';
import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import type {PermissionType} from "@/common/domain/permission.type";

@Injectable()
export class PermissionRepository implements IPermissionRepository {
    constructor(
        @InjectRepository(Permission)
        private readonly repository: Repository<Permission>,
        private readonly dataSource: DataSource,
    ) {
    }

    async findAll(): Promise<Permission[]> {
        return this.repository.find();
    }


    async findBySlug(slug: PermissionType): Promise<Permission | undefined> {
        const permission = await this.repository.createQueryBuilder("permission")
            .where("permission.slug = :slug", { slug })
            .getOne();
        return permission ?? undefined;
    }

  async findByDescription(description: string): Promise<Permission | undefined> {
    const permission = await this.repository.createQueryBuilder("permission")
      .where("permission.description = :description", { description })
      .getOne();

    return permission ?? undefined;
  }

    public async update(permission: Permission): Promise<void> {
            await this.dataSource
                .createQueryBuilder()
                .update("permissions")
                .set({
                    description: permission.getDescription(),
                    slug: permission.getSlug(),
                })
                .where("id = :id", {
                    id: permission.getId().toString(),
                })
                .execute();
    }

    public async save(permission: Permission): Promise<void> {
        await this.repository.save(permission);
    }
}

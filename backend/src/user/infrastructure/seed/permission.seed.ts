import {DataSource, In, Not} from "typeorm";
import {Permission} from "@/user/domain/entities/permission.entity";
import {ALL_PERMISSIONS} from "@/user/domain/constants/permission";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

export class PermissionSeeder {
    constructor(private readonly dataSource: DataSource) {}

    public async run(): Promise<void> {
        await this.dataSource.transaction(async (em) => {
            const permissionsRepository = em.getRepository(Permission);
            const slugs = [...ALL_PERMISSIONS];

            if (slugs.length > 0) {
                await permissionsRepository.createQueryBuilder()
                    .insert()
                    .into("permissions")
                    .values(slugs.map((slug) => ({
                        id: Uuid.generate().toString(),
                        slug,
                    })))
                    .orIgnore()
                    .execute();
            }
            await em.createQueryBuilder()
                .delete()
                .from("permissions")
                .where({ slug: Not(In(slugs)) })
                .execute();
        });
    }
}

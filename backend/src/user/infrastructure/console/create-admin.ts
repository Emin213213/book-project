import { Permission } from "@/user/domain/entities/permission.entity";
import * as prompt from "@clack/prompts";
import type { DataSource, EntityManager } from "typeorm";

import { HasherService } from "@/common/application/services/hasher.service";
import { Uuid } from "@/common/domain/value-objects/uuid.vo";
import { Role } from "@/user/domain/entities/role.entity";
import { User } from "@/user/domain/entities/user.entity";
import { UserEmailAlreadyExistsException } from "@/user/domain/exceptions/user-email-already-exists.exception";
import type { IRoleRepository } from "@/user/domain/repositories/role.repository.interface";
import { Email } from "@/user/domain/value-objects/email.vo";
import { RoleRepository } from "@/user/infrastructure/repository/role.repository";
import dataSource from "../../../../data-source";

const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_RULES = [
  { pattern: /[A-Z]/, message: "Добавьте заглавную латинскую букву" },
  { pattern: /[0-9]/, message: "Добавьте цифру" },
  { pattern: /[*?!@&]/, message: "Добавьте спецсимвол: * ? ! @ &" },
] as const;

type AdminInput = {
  readonly email: Email;
  readonly role: Role;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
};

/** Создаёт пользователя с выбранной административной ролью через интерактивный ввод. */
class CreateAdminCommand {
  constructor(
    private readonly database: DataSource,
    private readonly roleRepository: IRoleRepository,
    private readonly hasher: Pick<HasherService, "hash">,
  ) {}

  public async run(): Promise<void> {
    prompt.intro("Создание пользователя");
    const email = await this.readEmail();
    if (!email) {
      return;
    }
    await this.assertEmailAvailable(email, this.database.manager);

    const role = await this.readRole();
    if (!role) {
      return;
    }

    const credentials = await this.readCredentials();

    if (!credentials) {
      return;
    }


    const password = await this.hasher.hash(credentials.password);
    
    await this.database.transaction(async (manager) => {
      await this.assertEmailAvailable(email, manager);

      await this.assignAdminPermissions(role, manager);
      const user = this.createUser({ email, role, ...credentials, password });
      await manager.save(user);
      await manager
        .createQueryBuilder()
        .relation(User, "role")
        .of(user.id)
        .add(role.getId().toString());
    });
    prompt.outro("Пользователь успешно создан");
  }

  private async assignAdminPermissions(role: Role, manager: EntityManager): Promise<void> {
    if (role.slug !== "admin") {
      return;
    }
    const permissions = await manager.find(Permission);
    const assignedIds = new Set(role.permissions.map((permission) => permission.getId().toString()));
    const missingIds = permissions
      .map((permission) => permission.getId().toString())
      .filter((permissionId) => !assignedIds.has(permissionId));
    if (missingIds.length > 0) {
      await manager.createQueryBuilder().relation(Role, "permissions").of(role.id).add(missingIds);
    }
  }

  private async readEmail(): Promise<Email | undefined> {
    const input = await prompt.text({
      message: "Введите email",
      placeholder: "example@gmail.com",
      validate: (value) => {
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Введите корректный email";
        }
      },
    });

    const email = this.unwrapInput(input);
    return email === undefined ? undefined : new Email(email.trim());
  }

  private async readRole(): Promise<Role | undefined> {
    const input = await prompt.select({
      message: "Выберите роль",
      options: [
        { value: "admin", label: "Администратор" },
        { value: "manager", label: "Менеджер" },
        { value: "moderator", label: "Модератор" },
      ],
    });
    const slug = this.unwrapInput(input);
    if (slug === undefined) {
      return;
    }
    const role = await this.roleRepository.findBySlug(slug);

    if (!role) {
      prompt.log.error("Выбранная роль не найдена");
      process.exitCode = 1;
    }

    return role ?? undefined;
  }

  private async readCredentials(): Promise<Pick<AdminInput, "password" | "firstName" | "lastName"> | undefined> {
    const password = this.unwrapInput(
      await prompt.password({
        message: "Введите пароль",
        mask: "*",
        clearOnError: true,
        validate: (value) => this.validatePassword(value),
      }),
    );
    if (password === undefined) {
      return;
    }
    const firstName = await this.readName("Введите имя");
    if (firstName === undefined) {
      return;
    }
    const lastName = await this.readName("Введите фамилию");
    return lastName === undefined
      ? undefined
      : { password, firstName, lastName };
  }

  private validatePassword(value: string | undefined): string | undefined {
    if (!value || value.length < MIN_PASSWORD_LENGTH) {
      return `Минимум ${MIN_PASSWORD_LENGTH} символов`;
    }
    return PASSWORD_RULES.find((rule) => !rule.pattern.test(value))?.message;
  }

  private async readName(message: string): Promise<string | undefined> {
    const input = await prompt.text({
      message,
      validate: (value) =>
        value?.trim() ? undefined : "Введите непустое значение",
    });
    return this.unwrapInput(input)?.trim();
  }

  private unwrapInput(value: string | symbol): string | undefined {
    if (typeof value === "symbol") {
      prompt.cancel("Создание пользователя отменено");
      return;
    }
    return value;
  }

  private async assertEmailAvailable(
    email: Email,
    manager: EntityManager,
  ): Promise<void> {
    const existingUser = await manager.findOne(User, { where: { email } });
    if (existingUser) {
      throw new UserEmailAlreadyExistsException();
    }
  }

  private createUser(input: AdminInput): User {
    const user = User.createUserByEmail(
      input.email,
      input.password,
      input.firstName,
      input.lastName,
      "",
      [],
      Uuid.generate(),
    );
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiresAt = null;
    user.emailVerifiedAt = new Date();
    return user;
  }
}

function reportError(error: unknown): void {
  const message =
    error instanceof UserEmailAlreadyExistsException
      ? "Пользователь с таким email уже существует"
      : `Не удалось создать пользователя: ${error instanceof Error ? error.message : String(error)}`;
  prompt.log.error(message);
  process.exitCode = 1;
}

async function main(): Promise<void> {
  try {
    await dataSource.initialize();
    const command = new CreateAdminCommand(
      dataSource,
      new RoleRepository(dataSource.getRepository(Role), dataSource),
      new HasherService(),
    );
    await command.run();
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

void main().catch(reportError);

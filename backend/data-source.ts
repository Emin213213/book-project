  import { DataSource } from 'typeorm';
import { Book } from './src/book/domain/entities/book.entity';
import { User } from './src/user/domain/entities/user.entity';
import {Session} from "@/user/domain/entities/session.entity";
  import {Category} from "@/book/domain/entities/category.entity";
  import {Author} from "@/book/domain/entities/author.entity";
  import {Role} from "@/user/domain/entities/role.entity";
  import {Permission} from "@/user/domain/entities/permission.entity";

export default new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'book_shop',
  entities: [Book, User,Session,Category,Author,Role,Permission],
  migrations: ['migrations/*{.ts,.js}'],
  synchronize:false
});

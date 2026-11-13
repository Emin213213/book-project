import {join} from 'path';
import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BookModule} from './book/book.module';
import {UserModule} from './user/user.module';
import {CommonModule} from './common/common.module';
import {ConfigModule} from "@nestjs/config";
import {mailConfig} from "@/common/infrastructure/config/mail.config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [mailConfig]
        }),
        CommonModule,
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'root',
            database: 'book_shop',
            entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
            migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
            synchronize: false,
        }),

        UserModule,
        BookModule

    ],
})
export class AppModule {
}

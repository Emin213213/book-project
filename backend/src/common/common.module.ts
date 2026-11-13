import { STR_HELPER } from "@/common/application/ports/str-helper.interface";
import { Str } from "@/common/infrastructure/service/str";
import {Global, Module} from '@nestjs/common';
import {APP_FILTER} from '@nestjs/core';
import {MailerModule} from '@nestjs-modules/mailer';
import {join} from 'path';
import {DomainExceptionFilter} from './infrastructure/http/domain-exception.filter';
import {HttpErrorCodeExceptionFilter} from './infrastructure/http/http-error-code-exception.filter';
import {HasherService} from './application/services/hasher.service';
import {TemplateService} from "@/common/infrastructure/service/template.service";
import {TEMPLATE_SERVICE} from "@/common/domain/contracts/template.service.interface";
import {ConfigReader} from "@/common/application/services/config.reader";
import {mailConfig} from "@/common/infrastructure/config/mail.config";
import {ConfigType,ConfigModule} from "@nestjs/config";
import {HandlebarsAdapter} from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import {ILoggerService} from "@/common/application/services/tokens";
import {LoggerService} from "@/common/application/services/logger.service";
import {appConfig} from "@/common/infrastructure/config/app.config";
import {storageConfig} from "@/common/infrastructure/config/storage.config";
import {CommonFileStorage} from "@/common/application/services/common.file.storage";
import {diskConfig} from "@/common/infrastructure/config/disk.config";
import {FileStorageFactory} from "@/common/application/services/file-storage.factory";

// eslint-disable-next-line @typescript-eslint/no-require-imports


@Global()
@Module({
    imports: [
        ConfigModule.forFeature(mailConfig),
        ConfigModule.forFeature(appConfig),
        ConfigModule.forFeature(storageConfig),
        ConfigModule.forFeature(diskConfig),
        MailerModule.forRootAsync({
            imports:[ConfigModule.forFeature(mailConfig), ConfigModule.forFeature(appConfig)],
            inject: [mailConfig.KEY,appConfig.KEY],
            useFactory: (mail: ConfigType<typeof mailConfig>,app:ConfigType<typeof appConfig>) => ({
                transport: {
                    host: mail.host,
                    port: mail.port,
                    ignoreTLS: true
                },
                defaults: {
                    from: mail.from
                },
                template: {
                    dir: join(__dirname, '..'),
                    adapter: new HandlebarsAdapter(),
                    options: {strict: true}
                }
            })
        })
    ],
    providers: [
        { provide: STR_HELPER, useClass: Str },
        {provide: TEMPLATE_SERVICE, useClass: TemplateService},
        HasherService,
        ConfigReader,
        FileStorageFactory,
        {
            provide: APP_FILTER,
            useClass: HttpErrorCodeExceptionFilter,
        },
        {
            provide: APP_FILTER,
            useClass: DomainExceptionFilter,
        },
        {
            provide:ILoggerService,
            useClass: LoggerService
        }
    ],
    exports: [STR_HELPER, MailerModule, HasherService, TEMPLATE_SERVICE, ConfigReader, ILoggerService,FileStorageFactory],

})
export class CommonModule {
}

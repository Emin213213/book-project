import {Inject, Injectable} from "@nestjs/common";
import {mailConfig} from "@/common/infrastructure/config/mail.config";
import {ConfigType} from "@nestjs/config";
import path from "node:path";
import process from "node:process";
import {appConfig} from "@/common/infrastructure/config/app.config";
import {storageConfig} from "@/common/infrastructure/config/storage.config";


@Injectable()
export class ConfigReader {

    constructor(
        @Inject(mailConfig.KEY) private readonly mail: ConfigType<typeof mailConfig>,
        @Inject(appConfig.KEY) private readonly  app:ConfigType<typeof  appConfig>,
        @Inject(storageConfig.KEY) private readonly storage:ConfigType<typeof storageConfig>
    ) {
    }

    public getMailPort(): number {
        return this.mail.port
    }

    public getMailHost(): string {
        return this.mail.host
    }

    public getMailSender(): string {
        return this.mail.from
    }

    public getServerUrl(): string {
        return  this.app.host
    }

    public getFileStorage() {
        return this.storage.uploadDir

    }

    public getTempStorage() {
        return this.storage.tempDir
    }



}
import {Inject, Injectable} from "@nestjs/common";
import {CommonFileStorage} from "@/common/application/services/common.file.storage";
import {Express} from "express";
import path from "node:path";
import {ConfigReader} from "@/common/application/services/config.reader";
import {randomUUID} from "node:crypto";
import {FileStorageFactory} from "@/common/application/services/file-storage.factory";
import {FileStorage} from "@/common/domain/enum/file-storage.enum";
import {AbstractFileStorage} from "@/common/application/services/abstract-file.storage";

@Injectable()
export class AuthorAvatarStorage extends  AbstractFileStorage{

    private readonly PATH: string = 'author'
    private readonly commonFileStorage: CommonFileStorage


    constructor(
        @Inject() private readonly configReader: ConfigReader,
        factory: FileStorageFactory
    ) {
        super()
        this.commonFileStorage = factory.make(FileStorage.AUTHOR, configReader)
    }


    public async saveUploadedFile(file: Express.Multer.File, id: string) {
        const filename = this.generateRandomFileName(file)
        const relativePath = path.posix.join(this.PATH, id, filename);

        await this.commonFileStorage.save(file, relativePath);
        return relativePath;
    }

    public makeUrlFoPath(filename: string | undefined) {
        if (!filename) {
            return undefined
        }
        return this.commonFileStorage.url(filename)
    }

}

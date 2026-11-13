import {Inject, Injectable} from "@nestjs/common";
import * as path from 'node:path'
import {Express} from "express";
import * as fsp from 'node:fs/promises'
import {ConfigReader} from "@/common/application/services/config.reader";
import {FileStorage} from "@/common/domain/enum/file-storage.enum";

@Injectable()
export class CommonFileStorage {


    constructor(
        private readonly configReader:ConfigReader,
       private readonly  disk:FileStorage
    ) {
    }

    public async save(file: Express.Multer.File,filename:string): Promise<string> {

        const mergedFileName = path.posix.join(this.configReader.getFileStorage(),this.disk,filename)
        await fsp.mkdir(path.dirname(mergedFileName), {recursive: true})

        if (file.path) {
            await fsp.rename(file.path, mergedFileName)
        } else {
            await fsp.writeFile(mergedFileName, file.buffer)
        }

        return mergedFileName
    }

    public async exist(filename: string): Promise<boolean> {
        try {
            await fsp.access(path.join(this.configReader.getFileStorage(),this.disk, filename))

            return true
        } catch {
            return false
        }
    }

    public async delete(filename: string) {
        await fsp.rm(path.join(this.configReader.getFileStorage(),this.disk, filename), {force: true})

    }

    public url(url: string): string {
        const result = new URL(this.configReader.getServerUrl())
        const storageDirectory = path.basename(this.configReader.getFileStorage())

        result.pathname = path.posix.join(result.pathname, storageDirectory,this.disk, url)
        return result.toString()
    }

}

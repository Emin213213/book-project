import {Inject, Injectable} from "@nestjs/common";
import {ConfigReader} from "@/common/application/services/config.reader";
import {FileStorage} from "@/common/domain/enum/file-storage.enum";
import {CommonFileStorage} from "@/common/application/services/common.file.storage";

@Injectable()
export class FileStorageFactory {

    make(disk: FileStorage, configReader: ConfigReader) {
        return new CommonFileStorage(configReader, disk)
    }
}
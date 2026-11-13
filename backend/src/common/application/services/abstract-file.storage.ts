import {randomUUID} from "node:crypto";
import path from "node:path";

export  abstract  class AbstractFileStorage {

     protected generateRandomFileName(file:Express.Multer.File):string {
        return `${randomUUID()}${path.extname(file.originalname)}`;
    }
}
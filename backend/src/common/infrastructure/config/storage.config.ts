import {registerAs} from "@nestjs/config";
import * as path from "node:path";
import * as process from "node:process";

export  const storageConfig = registerAs('storage',() => ({
    tempDir:process.env.TEMP_UPLOAD_DIR??path.join(process.cwd(),'temp'),
    uploadDir:process.env.UPLOAD_DIR??path.join(process.cwd(),'storage')
}))

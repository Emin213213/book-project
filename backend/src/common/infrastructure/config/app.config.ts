
 import {registerAs} from '@nestjs/config'
 import * as process from "node:process";
 import path from "node:path";

 export  const appConfig = registerAs('app',() => ({
     host:process.env.APP_URL ?? 'http://localhost',
     tempStorage: path.join(process.cwd(), process.env.TEMP_UPLOAD_DIR??'temp'),
     storage:path.join(process.cwd(), process.env.UPLOAD_DIR??'storage')
 }))

 import {registerAs} from '@nestjs/config'
 import * as process from "node:process";

 export  const mailConfig = registerAs('mail',() => ({
     host:process.env.MAIL_HOST ?? 'localhost',
     port:parseInt(process.env.MAIL_PORT ?? '1025'),
     from:process.env.MAIL_FROM ??  '"Book Shop" <noreply@bookshop.com>'
 }))
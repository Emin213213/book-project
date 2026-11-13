import fs from 'node:fs/promises'
import  path from 'node:path'
import * as process from "node:process";
import {Injectable} from "@nestjs/common";
import {TemplateServiceInterface} from "@/common/domain/contracts/template.service.interface";
import  Handlebars from  'handlebars'
import  {readFile} from  'node:fs/promises'


@Injectable()
export class TemplateService  implements  TemplateServiceInterface{

    async render(module:string,templateName:string,data:Record<string, unknown>  =  {}):Promise<string> {
        const filePath = path.join(
            process.cwd(),
            'src',
            module,
            'infrastructure',
            'mail',
            `${templateName}.hbs`
        )

        const source = await  readFile(filePath,'utf-8')
        const template = Handlebars.compile(source)

        return  template(data)
    }
}







import {MailerServiceInterface, MailServiceOptionsType} from "@/common/domain/contracts/mailer.service.interface";
import nodemailer from 'nodemailer'
import {Inject, Injectable} from "@nestjs/common";
import {TEMPLATE_SERVICE, TemplateServiceInterface} from "@/common/domain/contracts/template.service.interface";
import {ConfigReader} from "@/common/application/services/config.reader";

@Injectable()
export abstract class MailService implements MailerServiceInterface {
    private transporter;
    public module: string = 'common'

    constructor(
        @Inject(TEMPLATE_SERVICE) private readonly templateService: TemplateServiceInterface,
        @Inject() private readonly configReader: ConfigReader
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.configReader.getMailHost(),
            port: this.configReader.getMailPort(),
            secure: false
        })
    }


    async send(options:MailServiceOptionsType): Promise<void> {
        const html = await this.templateService.render(
            this.module,
            options.template,
            options.data ?? {},
        )
        await this.transporter.sendMail({
            from: this.configReader.getMailSender(),
            to: options.to,
            subject: options.subject,
            html,
        });

    }


}


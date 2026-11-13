import {Inject, Injectable} from '@nestjs/common';
import {TEMPLATE_SERVICE, TemplateServiceInterface} from "@/common/domain/contracts/template.service.interface";
import {MailService} from "@/common/infrastructure/service/mail.service";
import {ConfigReader} from "@/common/application/services/config.reader";
import {Email} from "@/user/domain/value-objects/email.vo";


@Injectable()
export class UserMailService extends MailService {
    override module = 'user'

    constructor(
        @Inject(TEMPLATE_SERVICE) templateService: TemplateServiceInterface,
        @Inject() configReader: ConfigReader
    ) {
        super(templateService, configReader)
    }

    async sendWelcome(email: string, name: string,link:string ): Promise<void> {
        await this.send({
            to: email,
            subject: 'welcome to Book shop',
            template: 'welcome',
            // TODO: replace with real activation link (generate token + build url)
            data: {name, url: link}
        })
    }

    async sendPasswordReset(email: Email, token: string,link:string,reportLink:string): Promise<void> {
        await this.send({
            to: email.value,
            subject: 'Password Reset',
            template: 'password-reset',
            data: {token,link,reportLink},
        });
    }
}

export interface MailServiceOptionsType {
    to: string,
    subject: string,
    template: string,
    data?: Record<string, unknown>
}


export interface MailerServiceInterface {
    send(options: MailServiceOptionsType): Promise<void>
}
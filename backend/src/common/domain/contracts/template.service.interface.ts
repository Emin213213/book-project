export interface TemplateServiceInterface {
    render(
        module: string,
        template: string,
        data: Record<string, unknown>
    ): Promise<string>;

}

export  const  TEMPLATE_SERVICE = Symbol('TEMPLATE_SERVICE')
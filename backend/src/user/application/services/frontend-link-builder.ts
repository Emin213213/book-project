
export  class FrontendLinkBuilder {


    private  readonly baseLink:string = 'http://localhost:5173'


    public buildResetPasswordLink(token:string):string {
       return this.baseLink + `/reset-password?token=` + token
    }

    public buildVerifyEmailLink(token: string ): string  {
        return this.baseLink + `/verify-email?token=` + token;
    }

    public  resetPassword(token:string) {
        return this.baseLink + `/unnauthorization-action?token=${token}`
    }

}
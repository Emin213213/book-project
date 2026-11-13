import {Inject, Injectable} from "@nestjs/common";
import {OauthConfig} from "@/user/infrastructure/config/oauth.config";
import {ConfigType} from "@nestjs/config";

@Injectable()
export  class  ConfigReader {
    constructor(
        @Inject(OauthConfig.KEY) private  readonly oauth:ConfigType<typeof OauthConfig >
    ) {}


    public  getGoogleClientId():string {
        return this.oauth.googleClientId
    }
    public  getGoogleSecret():string {
        return  this.oauth.googleSecret
    }
    public getGoogleCallBackUrl():string {
        return  this.oauth.googleCallbackUrl
    }
  }
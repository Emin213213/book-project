import {LoggerServiceInterface} from "@/common/domain/contracts/logger.service.interface";
import {Logger} from '@nestjs/common/'
import {Inject, Injectable} from "@nestjs/common";
import {sprintf} from "sprintf-js";

@Injectable()
export class  LoggerService implements LoggerServiceInterface{

    private  _logger:Logger

    constructor() {
        this._logger = new Logger();
    }

    log(message:string, ...args: unknown[]): void {
        this._logger.log(sprintf(message,...args))
    }



    error(message:string,...args: unknown[]): void {
        this._logger.error(message,...args)
    }

    warn(message:string, ...args: unknown[]): void {
        this._logger.warn(message,...args)
    }


}
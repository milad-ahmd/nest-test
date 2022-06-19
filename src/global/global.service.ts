import { Injectable, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { ErrorType } from './models/error.model';
import { Log } from './models/log.model';
import { PersonValidOutDto } from '../person3/dto/person-valid-out.dto';

@Injectable()
export class GlobalService {
    constructor (
        @InjectModel('Log') private readonly log: Model<Log>
    ) {}
    error (status: number, message: string): ErrorType {
        const error: ErrorType = {status, message}
        return error;
    }
    async createLog (
        clientIp: String,
        who_userid: String,
        req_method: String,
        req_originalUrl: String,
        req_httpVersion: String,
        req_body: PersonValidOutDto,
        req_query: any,
        req_params: any,
        req_headers: any,
        res_headers: any,
        res_body: PersonValidOutDto,
        res_statusCode: string,
    ) {
        const newLog = new this.log({
            clientIp,
            who_userid,
            req_method,
            req_originalUrl,
            req_httpVersion,
            req_body,
            req_query,
            req_params,
            req_headers,
            res_headers,
            res_body,
            res_statusCode,
        })
        await newLog.save();
        return newLog;
    }
}
import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
import { PersonValidOutDto } from '../person3/dto/person-valid-out.dto';
import { GlobalService } from '../global/global.service';
const requestIp = require('request-ip');

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  constructor(private readonly globalService: GlobalService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    // codes before a req coming in:
    const req = context.switchToHttp().getRequest();
    const req_headers = req.headers;
    const req_params = req.params;
    const req_query = req.query;
    const req_body = req.body;
    const req_httpVersion = req.httpVersion;
    const req_originalUrl = req.originalUrl;
    const req_method = req.method;
    const clientIp = requestIp.getClientIp(req);

    return next.handle().pipe(
      map(async (data: any) => {
        // // codes before a res going out:
        // safety implementation for when we return nothing from some controller:
        if (data == undefined) data = {};
        // // remove things like password
        // let body;
        // if (
        //     req_originalUrl == "/person3/groupList" ||
        //     req_originalUrl == "/person/getCities" ||
        //     req_originalUrl == "/person/personExists" ||
        //     req_originalUrl == "/person/createPerson" ||
        //     req_originalUrl == "/person/list" ||
        //     req_originalUrl == "/person/updatePerson" ||
        //     req_originalUrl == "/person/delPerson" ||
        //     req_originalUrl == "/person/search" ||
        //     req_originalUrl == "/company/companyExists" ||
        //     req_originalUrl == "/company/createCompany" ||
        //     req_originalUrl == "/company/list" ||
        //     req_originalUrl == "/company/updateCompany" ||
        //     req_originalUrl == "/company/delCompany" ||
        //     req_originalUrl == "/company/search" ||
        //     req_originalUrl == "/company/searchWithConds"
        // ) {
        //     body = data;
        // } else {
        // body = plainToClass(PersonValidOutDto, data, {
        //         excludeExtraneousValues: true
        //     });
        // }
        // // don't remove things like password:
        const body = data;

        const res = context.switchToHttp().getResponse();
        res.on('finish', async () => {
          const res_headers = res.getHeaders();
          const res_body = body;
          const res_statusCode = res.statusCode;
          const who_userid = '0';
          // if (body._id != undefined) who_userid = body._id.toString();

          await this.globalService.createLog(
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
          );
        });
        return body;
      }),
    );
  }
}

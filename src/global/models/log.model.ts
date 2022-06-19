import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Mixed } from "mongoose";
import { PersonValidOutDto } from "../../person3/dto/person-valid-out.dto";

@Schema({
    collection: 'logs'
})
export class Log extends Document {
    @Prop({type: String})
    clientIp: string;
    @Prop({type: String})
    who_userid: string;
    @Prop({type: String})
    req_method: string;
    @Prop({type: String})
    req_originalUrl: string;
    @Prop({type: String})
    req_httpVersion: string;
    @Prop({type: PersonValidOutDto})
    req_body: PersonValidOutDto;
    @Prop({type: Object})
    req_query: any;
    @Prop({type: Object})
    req_params: any;
    @Prop({type: Object})
    req_headers: any;
    @Prop({type: Object})
    res_headers: any;
    @Prop({type: Object})
    res_body: PersonValidOutDto;
    @Prop({type: String})
    res_statusCode: string;
}
export const LogSchema = SchemaFactory.createForClass(Log);
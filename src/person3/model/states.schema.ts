import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class StatesSchemaClass {
    @Prop()
    Id: string;
    @Prop()
    StateFars: string;
    @Prop()
    StateEng: string;
    @Prop()
    CityFars: string;
    @Prop()
    CityEng: string;
    @Prop()
    Lat: string;
    @Prop()
    Long: string;
    @Prop()
    StateCity: string;
}
export type StatesSchemaType = Document & StatesSchemaClass;
export const StatesSchema = SchemaFactory.createForClass(StatesSchemaClass);
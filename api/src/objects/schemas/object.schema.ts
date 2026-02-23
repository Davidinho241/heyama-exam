import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ObjectDocument = HeyamaObject & Document;

@Schema({ timestamps: { createdAt: 'createdAt' } })
export class HeyamaObject {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  s3Key: string; // store for deletion

  createdAt: Date;
}

export const HeyamaObjectSchema = SchemaFactory.createForClass(HeyamaObject);

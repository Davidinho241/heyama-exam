import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HeyamaObject, ObjectDocument } from './schemas/object.schema';
import { S3Service } from '../s3/s3.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(HeyamaObject.name) private objectModel: Model<ObjectDocument>,
    private readonly s3Service: S3Service,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async findAll(): Promise<ObjectDocument[]> {
    return this.objectModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ObjectDocument> {
    const obj = await this.objectModel.findById(id).exec();
    if (!obj) throw new NotFoundException(`Object ${id} not found`);
    return obj;
  }

  async create(
    title: string,
    description: string,
    file: Express.Multer.File,
  ): Promise<ObjectDocument> {
    const { url, key } = await this.s3Service.uploadFile(file);

    const created = new this.objectModel({
      title,
      description,
      imageUrl: url,
      s3Key: key,
    });

    const saved = await created.save();

    // Emit real-time event to all connected clients
    this.eventsGateway.emitObjectCreated(saved);

    return saved;
  }

  async remove(id: string): Promise<void> {
    const obj = await this.findOne(id);

    // Delete from S3
    if (obj.s3Key) {
      await this.s3Service.deleteFile(obj.s3Key);
    }

    await this.objectModel.findByIdAndDelete(id).exec();

    // Emit real-time deletion event
    this.eventsGateway.emitObjectDeleted(id);
  }
}

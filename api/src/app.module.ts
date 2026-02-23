import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ObjectsModule } from './objects/objects.module';
import { EventsModule } from './events/events.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb+srv://kallamaxime_db_user:uEGiKUWeaRba9YjZ@heyamacluster.57c1k3h.mongodb.net/?appName=HeyamaCluster'),
      }),
      inject: [ConfigService],
    }),
    ObjectsModule,
    EventsModule,
    S3Module,
  ],
})
export class AppModule {}
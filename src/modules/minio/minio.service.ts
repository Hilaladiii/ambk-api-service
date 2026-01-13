import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: this.configService.get('MINIO_PORT'),
      useSSL: false,
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
  }

  async createBucket(bucketName: string) {
    try {
      const isBucketExists = await this.minioClient.bucketExists(bucketName);
      if (isBucketExists)
        throw new BadRequestException('Bucket already exists');
      await this.minioClient.makeBucket(bucketName);
    } catch (error) {
      throw new InternalServerErrorException('Create bucket failed', error);
    }
  }

  async deleteBucket(bucketName: string) {
    try {
      const isBucketExists = await this.minioClient.bucketExists(bucketName);
      if (!isBucketExists) throw new NotFoundException('Bucket not found');
      await this.minioClient.removeBucket(bucketName);
    } catch (error) {
      throw new InternalServerErrorException('Delete bucket failed', error);
    }
  }

  async uploadFile(file: Express.Multer.File, bucketName: string) {
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      await this.minioClient.putObject(
        bucketName,
        fileName,
        file.buffer,
        file.size,
      );
      const url = await this.getFileUrl(bucketName, fileName);
      return url;
    } catch (error) {
      throw new InternalServerErrorException('File upload failed', error);
    }
  }

  async updateFile(
    file: Express.Multer.File,
    fileName: string,
    bucketName: string,
  ) {
    try {
      const url = await this.getFileUrl(bucketName, fileName);
      if (!url) throw new NotFoundException('File not found');
      await this.deleteFile(bucketName, url);
      return await this.uploadFile(file, bucketName);
    } catch (error) {
      throw new InternalServerErrorException('File update failed', error);
    }
  }

  async getFileUrl(bucketName: string, fileName: string) {
    try {
      return this.minioClient.presignedUrl('GET', bucketName, fileName);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteFile(bucketName: string, url: string) {
    try {
      const fileName = this.getFileNameFromUrl(url);
      await this.minioClient.removeObject(bucketName, fileName);
    } catch (error) {
      throw new InternalServerErrorException('File delete failed', error);
    }
  }

  private getFileNameFromUrl(url: string) {
    const urlObject = new URL(url);
    const pathname = urlObject.pathname;
    const fileName = pathname.split('/').pop();
    return fileName;
  }
}

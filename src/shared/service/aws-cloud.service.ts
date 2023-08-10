import aws from 'aws-sdk';
import config from '../../config';

export default class AwsCloud {
  private static bucket: string = config.AWS.BUCKET_NAME;
  private static config: aws.S3.Types.ClientConfiguration = {
    endpoint: 'fra1.digitaloceanspaces.com',
    region: 'fra1',
    credentials: {
      accessKeyId: config.AWS.ACCESS_ID,
      secretAccessKey: config.AWS.ACCESS_KEY,
    },
  };

  private static s3: aws.S3 = new aws.S3(this.config);

  public static async bulk(files: Array<Express.Multer.File>, path: string): Promise<Array<{ location: string; key: string }>> {
    return await Promise.all<{ location: string; key: string }>(files.map((file: Express.Multer.File) => this.upload(file, path)));
  }

  public static async upload(file: Express.Multer.File, path: string): Promise<{ location: string; key: string }> {
    return new Promise(async (resolve, reject) => {
      this.s3.upload(
        { Bucket: this.bucket, Key: `${path}/${Date.now()}.${file.originalname.split('.').pop()}`, Body: file.buffer, ACL: 'public-read' },
        (err, data) => (err ? reject(err) : resolve({ location: data.Location, key: data.Key }))
      );
    });
  }

  public static async delete(key: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      this.s3.deleteObject({ Bucket: this.bucket, Key: key }, (err) => (err ? reject(false) : resolve(true)));
    });
  }
}

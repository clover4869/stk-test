import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class S3TriggerStkUploadStack extends cdk.Stack {
  public readonly fileUploadBucket: s3.IBucket; 
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props
    });
    const BUCKET_UPLOAD_ORIGIN_NAME = process.env.BUCKET_UPLOAD_ORIGIN_NAME || 'BUCKET_UPLOAD_ORIGIN_NAME';
    const SQS_QUEUE_NAME = process.env.SQS_QUEUE_NAME || 'SQS_QUEUE_NAME'

    // define bucket
    this.fileUploadBucket = s3.Bucket.fromBucketName(this, BUCKET_UPLOAD_ORIGIN_NAME, BUCKET_UPLOAD_ORIGIN_NAME);
    
    // Create SQS queue
    const queue = new sqs.Queue(this, SQS_QUEUE_NAME, {
      visibilityTimeout: cdk.Duration.seconds(30),
      queueName: SQS_QUEUE_NAME
    });
    // node -e "require('./amplify/functions/trigger-s3/handler').handler(require('./test_event.json'), {}, console.log)"

    const s3TriggerLambda = new NodejsFunction(this, 'S3TriggerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X, 
      handler: 'handler',
      entry: './amplify/functions/trigger-s3/handler.ts',
      functionName: 'S3TriggerLambda',
      description: 'Custom Lambda function created using CDK. Using to trigger upload file from s3 and push msg to sqs.',
      memorySize: 128,
      environment: {
        QUEUE_URL: queue.queueUrl,
        CURRENT_ENV : process.env.CURRENT_ENV || '',
        REGION : this.region
      }
    });

        // add permission send msg to lambda function
        queue.grantSendMessages(s3TriggerLambda)
    this.fileUploadBucket.grantRead(s3TriggerLambda);

    this.fileUploadBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3Notifications.LambdaDestination(s3TriggerLambda));

    new CfnOutput(this, 'S3TriggerLambdaArn', {
      value: s3TriggerLambda.functionArn,
      exportName: 'S3TriggerLambdaArn',
    });
  }
}

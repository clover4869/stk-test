import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';

export class S3TriggerStkUploadStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props
    });

    // define bucket
    const bucket = s3.Bucket.fromBucketName(this, 'StkUploadFile', 'dev-stk-original-s3');
    
    // Create SQS queue
    const queue = new sqs.Queue(this, 'dev-s3-upload-queue', {
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    const s3TriggerLambda = new lambda.Function(this, 'S3TriggerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X, 
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('./amplify/functions/trigger-s3'),
      functionName: 'S3TriggerLambda',
      description: 'Custom Lambda function created using CDK. Using to trigger upload file from s3 and push msg to sqs.',
      memorySize: 128,
      environment: {
        QUEUE_URL: queue.queueUrl,
      }
    });

    bucket.grantRead(s3TriggerLambda);

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3Notifications.LambdaDestination(s3TriggerLambda));

    new CfnOutput(this, 'S3TriggerLambdaArn', {
      value: s3TriggerLambda.functionArn,
      exportName: 'S3TriggerLambdaArn',
    });
  }
}

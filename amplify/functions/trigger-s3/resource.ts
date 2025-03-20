import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';

export class S3TriggerStkUploadStack extends cdk.Stack {
  public readonly fileUploadBucket: s3.IBucket; 

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props
    });

    this.fileUploadBucket = s3.Bucket.fromBucketName(this, 'StkUploadFile', 'stk-upload-file');
    console.log({process, 'process.env.TEST_ENV' : process.env.TEST_ENV, 'process.env.TEST_ENV_BUILD' : process.env.TEST_ENV_BUILD})

    const s3TriggerLambda = new lambda.Function(this, 'S3TriggerLambda', {
      runtime: lambda.Runtime.NODEJS_18_X, // Specify the runtime
      handler: 'handler.handler',           // Specify the handler function
      code: lambda.Code.fromAsset('./amplify/functions/trigger-s3'),
      functionName: 'S3TriggerLambda',
      description: 'This is my custom Lambda function created using CDK',
      memorySize: 128,
      environment: {
        TEST: process.env.TEST_ENV || 'process.env.TEST_ENV doesnot have value',
        ENVIRONMENT: process.env.ENVIRONMENT   || 'process.env.ENVIRONMENT ',
        LOCAL : process.env.LOCAL   || 'process.env.LOCAL '
      }
    });

    this.fileUploadBucket.grantRead(s3TriggerLambda);

    this.fileUploadBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3Notifications.LambdaDestination(s3TriggerLambda));

    new CfnOutput(this, 'S3TriggerLambdaArn', {
      value: s3TriggerLambda.functionArn,
      exportName: 'S3TriggerLambdaArn',
    });
  }
}

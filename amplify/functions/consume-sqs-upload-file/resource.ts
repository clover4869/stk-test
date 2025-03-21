import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as eventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ConsumeSqsUploadStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props
    });
    const SQS_QUEUE_UPLOAD_FILE_NAME = process.env.SQS_QUEUE_UPLOAD_FILE_NAME || 'SQS_QUEUE_UPLOAD_FILE_NAME'

    // Create SQS queue
    const queue = new sqs.Queue(this, SQS_QUEUE_UPLOAD_FILE_NAME, {
      visibilityTimeout: cdk.Duration.seconds(30),
    });
    // node -e "require('./amplify/functions/sqs-trigger-lambda/handler').handler(require('./test_event.json'), {}, console.log)"

    const consumeSqsLambda = new NodejsFunction(this, 'ConsumeSqsUploadFileFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: './amplify/functions/consume-sqs-upload-file/handler.ts',
      functionName: 'ConsumeSqsUploadFileFn',
      description: 'Use lambda function to consume sqs upload file queue',
      memorySize: 128,
      environment: {
        CURRENT_ENV : process.env.CURRENT_ENV || '',
        SQS_QUEUE_URL: queue.queueUrl,
        API_TOKEN: process.env.API_TOKEN || '',
        CELERY_TASK_API_URL: process.env.CELERY_TASK_API_URL || '',
        AWS_REGION: this.region,
      },
    });

    queue.grantConsumeMessages(consumeSqsLambda);

    consumeSqsLambda.addEventSource(new eventSources.SqsEventSource(queue));

    new CfnOutput(this, 'ConsumeSqsUploadFileFnArn', {
      value: consumeSqsLambda.functionArn,
      exportName: 'ConsumeSqsUploadFileFn',
    });
  }
}
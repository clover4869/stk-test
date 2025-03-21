import { SQSEvent } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

// Initialize SQS client
const sqs = new SQSClient({ region: process.env.REGION || 'ap-northeast-1' });
const queueUrl = process.env.QUEUE_URL || '';

export const handler = async (event: SQSEvent) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log({ process, event, queueUrl, sqs });


};

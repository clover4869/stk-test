import { S3Event } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

// Initialize SQS client
const sqs = new SQSClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const queueUrl = process.env.QUEUE_URL || '';

export const handler = async (event: S3Event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log({ process, event });

  try {
    const record = event.Records[0];
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;
    const s3Path = `s3://${bucketName}/${objectKey}`;

    const message = {
      bucket: bucketName,
      object_key: objectKey,
      s3_path: s3Path,
    };

    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
    };

    console.log({ message, params });

    // Send message to SQS
    const command = new SendMessageCommand(params);
    const response = await sqs.send(command);

    console.log('Message sent:', response.MessageId);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Message sent successfully',
        messageId: response.MessageId,
      }),
    };
  } catch (error: any) {
    console.error('Error processing event:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing event',
        error: error.message,
      }),
    };
  }
};

const AWS = require("aws-sdk");
const dotenv = require("dotenv");

// Load environment variables from `.env` only in local development
if (process.env.CURRENT_ENV === "local") {
  dotenv.config();
}

const sqs = new AWS.SQS();
const queueUrl = process.env.QUEUE_URL || "";

exports.handler = function (event, context, callback) {
  console.log("Received event:", JSON.stringify(event, null, 2));
  console.log("Environment:", process);

  try {
    const record = event.Records[0];
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;
    const s3Path = "s3://" + bucketName + "/" + objectKey;

    const message = {
      bucket: bucketName,
      object_key: objectKey,
      s3_path: s3Path,
    };

    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message),
    };
    
    console.log({message, params});

    sqs.sendMessage(params, function (err, data) {
      if (err) {
        console.error("Error sending message:", err);
        callback(null, {
          statusCode: 500,
          body: JSON.stringify({
            message: "Error sending message",
            error: err.message,
          }),
        });
      } else {
        callback(null, {
          statusCode: 200,
          body: JSON.stringify({
            message: "Message sent successfully",
            messageId: data.MessageId,
          }),
        });
      }
    });
  } catch (error) {
    console.error("Error processing event:", error);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing event",
        error: error.message,
      }),
    });
  }
};

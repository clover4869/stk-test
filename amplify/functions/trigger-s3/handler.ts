export const handler = async (event: any) => {
    console.log('Received SQS event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        console.log('Processing SQS message:', record.body);
    }

    return {
        statusCode: 200,
        body: 'Messages processed successfully!',
    };
};

module.exports.handler = async (event) => {
    console.log('======================================================================================');
    console.log('Received SQS event:', JSON.stringify(event, null, 2));
    console.log( process.env.TEST_ENV );
    for (const record of event.Records) {
        console.log('Processing SQS message:', record.body);
    }
    console.log('======================================================================================');
    return {
        statusCode: 200,
        body: 'Messages processed successfully!',
    };
};
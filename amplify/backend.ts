import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { S3TriggerStkUploadStack } from './functions/trigger-s3/resource';

const backend = defineBackend({
  auth,
  data,
});

new S3TriggerStkUploadStack(
  backend.createStack('S3TriggerStkUploadStack'),
  's3TriggerStkUploadStack',
  {}
);
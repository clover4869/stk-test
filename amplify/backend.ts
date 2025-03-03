import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { S3TriggerStack } from './functions/trigger-s3/resource';

const backend = defineBackend({
  auth,
  data,
});

new S3TriggerStack(
  backend.createStack('S3TriggerStack'),
  's3TriggerUploadStack',
  {}
);
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('CF_ACCESS_KEY_ID'),
        secretAccessKey: env('CF_ACCESS_SECRET'),
        // R2 requires 'us-east-1' to trick the AWS SDK, even if your bucket is elsewhere
        region: 'us-east-1', 
        endpoint: env('CF_ENDPOINT'),
        params: {
          Bucket: env('CF_BUCKET'),
        },
        // CRITICAL: This forces the tool to understand Cloudflare's URL structure
        forcePathStyle: true, 
      },
    },
  },
});

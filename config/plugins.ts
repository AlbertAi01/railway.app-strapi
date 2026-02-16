export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('CF_ACCESS_KEY_ID'),
        secretAccessKey: env('CF_ACCESS_SECRET'),
        region: 'auto',
        params: {
          Bucket: env('CF_BUCKET'),
        },
        endpoint: env('CF_ENDPOINT'),
      },
    },
  },
});

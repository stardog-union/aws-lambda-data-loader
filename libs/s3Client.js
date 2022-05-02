// Create service client module using Common JS syntax
const { S3Client } = require("@aws-sdk/client-s3");


// Set the AWS Region.
const REGION = "us-east-1"; //e.g. "us-east-1"


// Export a new Amazon S3 service client object.
exports.s3Client = new S3Client({ region: REGION });

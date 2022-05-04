const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("./libs/s3Client.js");

const testing = false;


/*
  Bucket parameter Example
*/

// const bucketParams = {
//   Bucket: "rafasrdfdata",
//   Key: "talladega-data.ttl",
// };


exports.s3Handler = async (bucketParams) => {
  try {

    console.log("Getting from S3");
    // Create a helper function to convert a ReadableStream to a string.
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        console.log("Stream to String");
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      });

    // Get the object} from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(new GetObjectCommand(bucketParams));

    if (testing) {
      return data; // For unit tests.
    }
    console.log("Getting Body Contents");
    // Convert the ReadableStream to a string.
    const bodyContents = await streamToString(data.Body);
    // console.log(bodyContents);
      return bodyContents;
  } catch (err) {
    console.log("Error", err);
  }
};



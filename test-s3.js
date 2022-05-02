const { s3Handler } = require("./get-s3-resource.js")

const bucketParams = {
  Bucket: "rafasrdfdata",
  Key: "talladega-data.ttl",
};

s3Handler(bucketParams)
# aws-lambda-data-loader

An AWS Lambda function to get data from S3 and load it into [Stardog](https://www.stardog.com/)


## Prerequisites

- Setup the `.env` configuration file with the following environement variables. 

> An example of the `.env` file is found in the root of the project named `example.env`

   ```
   STARDOG_DATABASE=test
   STARDOG_USERNAME=admin
   STARDOG_PASSWORD=admin
   STARDOG_ENDPOINT="https://localhost:5820"

   AWS_S3_BUCKET=bucket-name
   AWS_S3_KEY="data-file-on-s3.ttl"
   ```

- A running Stardog Server with a database named the same as `STARDOG_DATABASE` found in the `.env`

- A local node environment

## Deploy to AWS Lambda

1. Build the project with `npm install`

2. Configure your AWS CLI
   `aws configure`

3. Create a package to deploy to AWS lambda
   `zip -r function.zip .`

4. Update the function
   `aws lambda update-function-code --function-name s3tostardog --zip-file fileb://function.zip`

5. Verify that the update was "Successful"
   `aws lambda get-function --function-name s3tostardog`
   
6. Run the function from the AWS console. 

7. Verify that the lambda function worked by querying Stardog 


# Reference

Lambda Handler Reference
https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html

AWS Lambda packaging
https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html#nodejs-package-dependencies

Granting access to S3
https://aws.amazon.com/premiumsupport/knowledge-center/lambda-execution-role-s3-bucket/

stardog.js - Javascript wrapper for communicating with the Stardog HTTP server.
https://github.com/stardog-union/stardog.js

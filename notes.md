Create a package to deplot to aws lambda
`zip -r function.zip .`

Configure your AWS CLI
`aws configure`

Update a function
`aws lambda update-function-code --function-name s3tostardog --zip-file fileb://function.zip`


Get a function
`aws lambda get-function --function-name s3tostardog`


Need to set Connection details, database, credentials in `.env` file

Reference

Lambda Handler
https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html

Deploy the code
https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html#nodejs-package-dependencies


Granting access to S3
https://aws.amazon.com/premiumsupport/knowledge-center/lambda-execution-role-s3-bucket/

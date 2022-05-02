const { Connection, db } = require('stardog');
const { s3Handler } = require("./get-s3-resource.js")
require('dotenv').config();


/*
    AWS Lambda S3 to Stardog Data Loader

    This proof of concept is split into the following parts:

    - Configuration

    - Function Definitions

    - Execution
*/


/*
    Configuration
*/

const database = process.env.STARDOG_DATABASE

const connectionDetails = {
    username: process.env.STARDOG_USERNAME,
    password: process.env.STARDOG_PASSWORD,
    endpoint: process.env.STARDOG_ENDPOINT
}

s3BucketParams = {
    Bucket: "rafasrdfdata",
    Key: "talladega-data.ttl",
  };

const data = `<http://stardog.com/example/subject/talladega-nights/shake> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://stardog.com/example/object/talladega-nights-movie-reference> .
                <http://stardog.com/example/subject/talladega-nights/bake> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://stardog.com/example/object/talladega-nights-movie-reference> .`


/*
    Function definitions
*/

const getS3Data = async (bucketParams) => {

    const data = await s3Handler(bucketParams)

    return data;
    
}


// Logging Utility Function
const logger = {
    logInfo: true,
    info: (message) => {
        if (logger.logInfo) console.log(`INFO - ${new Date(Date.now()).toLocaleString()} - ${message}`)
    },
    debug: (message) => console.log(`DEBUG - ${new Date(Date.now()).toLocaleString()} - ${message}`),
    warn:  (message) => console.log(`WARN - ${new Date(Date.now()).toLocaleString()} - ${message}`)
}


// Returns a connection using connection Details (connDetails)
const getConnection = (connDetails) => { 
    // TODO the calling function should pass a function here. getConnection will execute the function and 
    // the connection will be guaranteed to closed withing this scope.

    logger.info(`Creating a connection with ${JSON.stringify(connDetails)}`);

    const conn = new Connection(connDetails);

    logger.info(conn)
    return conn;
}


// Begins a transaction
const beginTransaction = (connectionDetails, database) => {

    const conn = getConnection(connectionDetails)

    return db.transaction.begin(conn, database).then( (response) => {

        // TODO - If we can not begin the transaction then throw an error
        
        // if (!response.ok) {
        //     throw ("Failed to begin Transaction")
        // }

        const transactionId = response.transactionId

        logger.info(`Begin Transaction: ${transactionId}`)

        return transactionId;
    })
};


// Adds data within a transaction
const addData = (connDetails, database, transactionId, data) => {

    let options = {
        encoding: undefined,
        contentType: "text/turtle"
    }

    let params = {};

    const conn = new Connection(connDetails);

    return db.add(conn, database, transactionId, data, options, params).then( (result) => {

        console.log(result); // prints the result from db.add(conn, ...)


        if (!result.ok) {
            // what if this fails? :grimacing: -- result is always false because the tx failed, even if rollback is fine
            return db.transaction.rollback(conn, database, transactionId).then((rollbackResponse) => {

                logger.debug("Data failed to be added. Rolling back the transaction");
                logger.debug(`Rollback Response Status: ${rollbackResponse.status}`);

                return false;
            });
        }

        return db.transaction.commit(conn, database, transactionId).then( () => {

            logger.info("Data added and Transaction committed successfully.");

            return true;
            }
        )

    })
}


/*
    Execution
*/


exports.handler = async (event) => {

    const data = await getS3Data(s3BucketParams);

  const promise = new Promise( (resolve, reject) => {
        resolve(beginTransaction(connectionDetails, database).then( (txId) => {
            logger.info(`out: ${txId}`)
            
            console.log("The data after the promise")

            console.log(data)
        
            addData(connectionDetails, database, txId, data).then((res) => {
                logger.info(`Add data returned: ${res}`)
            })
        }))
    }).catch( (error) => { // TODO implement better error handling that can pinpoint where in this process did the failure occur.
        console.error(error);
    })
  return promise
}

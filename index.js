const { Connection, db } = require('stardog');
require('dotenv').config();


/*
    Configuration
*/

const database = process.env.STARDOG_DATABASE

const connectionDetails = {
    username: process.env.STARDOG_USERNAME,
    password: process.env.STARDOG_PASSWORD,
    endpoint: process.env.STARDOG_ENDPOINT,


}

console.log(connectionDetails)


const data = `<http://stardog.com/example/subject/talladega-nights/shake> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://stardog.com/example/object/talladega-nights-movie-reference> .
                <http://stardog.com/example/subject/talladega-nights/bake> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://stardog.com/example/object/talladega-nights-movie-reference> .`


/*
    Logging Utility Function
*/

const logger = {
    logInfo: true,
    info: (message) => {
        if (logger.logInfo) console.log(`INFO - ${new Date(Date.now()).toLocaleString()} - ${message}`)
    },
    debug: (message) => console.log(`DEBUG - ${new Date(Date.now()).toLocaleString()} - ${message}`),
    warn:  (message) => console.log(`WARN - ${new Date(Date.now()).toLocaleString()} - ${message}`)
}



/*
    Function definitions
*/


// Returns a connection
const getConnection = (connDetails) => {
    logger.debug(` creating a connection with ${JSON.stringify(connDetails)}`);

    const conn = new Connection(connDetails);

    console.log(conn)
    return conn;
}

// Begins a transaction
const beginTransaction = (connectionDetails, database) => {

    const conn = getConnection(connectionDetails)

    return db.transaction.begin(conn, database).then( (response) => {
        // if (!response.ok) {
        //     throw ("Failed to begin Transaction")
        // }

        const transactionId = response.transactionId

        logger.info(`Begin Transaction: ${transactionId}`)

        return transactionId;
    })
};

// Adds data
const addData = (connectionDetails, database, transactionId) => {

    let options = {
        // @ts-ignore working around an issue in stardog.js
        encoding: undefined,
        contentType: "text/turtle"
    }

    let params = {}

    // db.add(conn, database, transactionId, content, options, params)
    return db.add(getConnection(connectionDetails), database, transactionId, data, options, params).then( (result) => {

        console.log(result) // debug


        if (!result.ok) {
            // what if this fails? :grimacing: -- result is always false because the tx failed, even if rollback is fine
            return db.transaction.rollback(getConnection(connectionDetails), database, transactionId).then((rollbackResponse) => {
                logger.debug("Data failed to be added. Rolling back the transaction");
                logger.debug(`Rollback Response Status: ${rollbackResponse.status}`)
                return false;
            });
        }

        return db.transaction.commit(getConnection(connectionDetails), database, transactionId).then( () => {

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
  const promise = new Promise( (resolve, reject) => {
        resolve(beginTransaction(connectionDetails, database).then( (txId) => {
            logger.info(`out: ${txId}`)
        
            addData(connectionDetails, database, txId).then((res) => {
                logger.info(`Add data returned: ${res}`)
            })
        }))
    })
  return promise
}

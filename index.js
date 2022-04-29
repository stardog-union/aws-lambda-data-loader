const { Connection, db } = require('stardog');


/*
    Configuration
*/

const database = "test"

const connectionDetails = {
    username: 'admin',
    password: 'admin',
    endpoint: 'http://localhost:5820',
}

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
const getConnection = () => {
    return new Connection(connectionDetails);
}

// Begins a transaction
const beginTransaction = () => {

    return db.transaction.begin(getConnection(), database).then( (response) => {
        if (!response.ok) {
            logger.debug("Failed to begin Transaction")
            return false;
        }

        const transactionId = response.transactionId

        logger.info(`Begin Transaction: ${transactionId}`)

        return transactionId;
    })
};

// Adds data
const addData = (transactionId) => {

    let options = {
        // @ts-ignore working around an issue in stardog.js
        encoding: undefined,
        contentType: "text/turtle"
    }

    let params = {}

    // db.add(conn, database, transactionId, content, options, params)
    return db.add(getConnection(), database, transactionId, data, options, params).then( (result) => {

        console.log(result) // debug


        if (!result.ok) {
            // what if this fails? :grimacing: -- result is always false because the tx failed, even if rollback is fine
            return db.transaction.rollback(getConnection(), database, transactionId).then((rollbackResponse) => {
                logger.debug("Data failed to be added. Rolling back the transaction");
                logger.debug(`Rollback Response Status: ${rollbackResponse.status}`)
                return false;
            });
        }

        return db.transaction.commit(getConnection(), database, transactionId).then( () => {

            logger.info("Data added and Transaction committed successfully.");

            return true;
            }
        )
    })
}


/*
    Execution
*/

beginTransaction().then( (txId) => {
    logger.info(`out: ${txId}`)

    addData(txId).then((res) => {
        logger.info(`Add data returned: ${res}`)
    })

})

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

const data = "<http://stardog.com/mydata/subject> <http://stardog.com/mydata/predicate> <http://stardog.com/mydata/object> ."


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

    return db.add(getConnection(), database, transactionId, data, {
        // @ts-ignore working around an issue in stardog.js
        encoding: undefined,
        contentType: "text/turtle"
    }).then( (result) => {

        console.log(result) // debug


        if (!result.ok) {
            // what if this fails? :grimacing: -- result is always false because the tx failed, even if rollback is fine
            return db.transaction.rollback(getConnection(), db, transactionId).then(() => {
                logger.debug("Data failed to be added. Rolling back the transaction");
                return false;
            });
        }

        db.transaction.commit(getConnection(), database, transactionId).then( () => {

            logger.info("Data added and Transaction Commited Succesfully.");

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

    addData().then((res) => {
        logger.info(res)
    })

})

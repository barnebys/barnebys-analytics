const path = require('path')
const BigQuery = require('@google-cloud/bigquery');
const key = require('../../key.json')

const { project_id } = key

const bigquery = BigQuery({
    projectId: project_id,
    keyFilename: path.resolve(__dirname, '../../key.json'),
});

const datasetId = 'tracking'
const schema = {
    programId: 'string',
    url: 'string',
    clientIP: 'string',
    userAgent: 'string',
    locale: 'string',
    category: 'string',
    action: 'string',
    label: 'string',
    value: 'string',
    currency: 'string',
    timestamp: 'datetime',
    sessionId: 'string',
}
const schemaString = Object
    .entries(schema)
    .reduce((schStr, [columnName, columnType]) => {
        const column = `${columnName}:${columnType}`
        if (!schStr) {
            return column
        }
        return `${schStr}, ${column}`
    }, '')


module.exports = {
    insert: (tableName, rows, timestamp) => {
        const rowsWithTimestamp = rows.map(row => ({
            ...row,
            timestamp: BigQuery.datetime(timestamp),
        }))

        return bigquery
            .dataset(datasetId)
            .table(tableName)
            .insert(rowsWithTimestamp, {
                autoCreate: true,
                schema: schemaString,
            })
    }
}
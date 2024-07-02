const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const data = JSON.parse(event.body);

    const params = {
        TableName: 'BVYLLeaders', // DynamoDB table name from environment variables
        Item: {
            Name: data.name,
            School: data.team,
            PhoneNumber: data.phone,
            Email: data.email,
        }
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ message: 'Leader added successfully' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ message: 'Error adding leader', error: error.message })
        };
    }
};

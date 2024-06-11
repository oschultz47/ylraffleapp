const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  let params = {
    TableName: 'BVYLRaffleDatabase',
  };

  if (event.path === '/leaders') {
    params = {
      ...params,
      FilterExpression: '#leader = :true',
      ExpressionAttributeNames: {
        '#leader': 'Leader',
      },
      ExpressionAttributeValues: {
        ':true': true,
      },
    };
  }
    
  if (event.path === '/kids') {
    params = {
      ...params,
      FilterExpression: '#leader = :false',
      ExpressionAttributeNames: {
        '#leader': 'Leader',
      },
      ExpressionAttributeValues: {
        ':false': false,
      },
    };
  }
    


  try {
    const data = await dynamodb.scan(params).promise();
    const items = data.Items || [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },
      body: JSON.stringify(items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

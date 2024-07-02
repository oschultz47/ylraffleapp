const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  let params = {};

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Calculate ISO timestamp for 24 hours ago

  if (event.path === '/raffle') {
    params = {
      ...params,
      TableName: 'BVYLRaffleDatabase',
      FilterExpression: '#timestamp >= :oneDayAgo',
      ExpressionAttributeNames: {
        '#timestamp': 'timestamp',
      },
      ExpressionAttributeValues: {
        ':oneDayAgo': oneDayAgo,
      },
    };
  }

  if (event.path === '/leaders') {
    params = {
      ...params,
      TableName: 'BVYLLeaders',
    };
  }
    
  if (event.path === '/kids') {
    params = {
      ...params,
      TableName: 'BVYLRaffleDatabase',
    };
  }

  try {
    let items = [];

    if (event.path === '/allnames') {
      const raffleParams = {
        TableName: 'BVYLRaffleDatabase',
      };

      const leadersParams = {
        TableName: 'BVYLLeaders',
      };

      const raffleData = await dynamodb.scan(raffleParams).promise();
      const leadersData = await dynamodb.scan(leadersParams).promise();

      items = [...(raffleData.Items || []), ...(leadersData.Items || [])];
    } else {
      const data = await dynamodb.scan(params).promise();
      items = data.Items || [];
    }

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

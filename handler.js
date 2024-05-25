'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1'
});

const TABLE_NAME = process.env.BOOKINGS_TABLE;

module.exports.createBooking = async (event) => {
  try {
    const { customerName, bookingDate, serviceType } = JSON.parse(event.body);
    const id = uuid.v4();
    const newBooking = { id, customerName, bookingDate, serviceType };
    await docClient.put({
      TableName: TABLE_NAME,
      Item: newBooking
    }).promise();
    return {
      statusCode: 201,
      body: JSON.stringify(newBooking)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

module.exports.getBookings = async () => {
  try {
    const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

module.exports.getBookingById = async (event) => {
  try {
    const { id } = event.pathParameters;
    const data = await docClient.get({
      TableName: TABLE_NAME,
      Key: { id }
    }).promise();
    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Booking not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(data.Item)
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

module.exports.updateBooking = async (event) => {
  try {
    const { id } = event.pathParameters;
    const { customerName, bookingDate, serviceType } = JSON.parse(event.body);
    await docClient.update({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'set customerName = :customerName, bookingDate = :bookingDate, serviceType = :serviceType',
      ExpressionAttributeValues: {
        ':customerName': customerName,
        ':bookingDate': bookingDate,
        ':serviceType': serviceType
      }
    }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ id, customerName, bookingDate, serviceType })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

module.exports.deleteBooking = async (event) => {
  try {
    const { id } = event.pathParameters;
    await docClient.delete({
      TableName: TABLE_NAME,
      Key: { id }
    }).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Booking deleted successfully' })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};

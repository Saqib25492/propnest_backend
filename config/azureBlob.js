const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("Azure Blob Storage connection string is missing.");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

const getContainerClient = (containerName) => {
  return blobServiceClient.getContainerClient(containerName);
};

module.exports = getContainerClient;

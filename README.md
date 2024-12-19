# Welsh Government Tender Application

## Introduction

This project aims to create a way for Local Councils within Wales, as well as the Welsh Government, to create a transparent way for their proposed projects to be voted on by elected officials and bid on by potential contractors.

The overarching idea is that the app will allow the public to see what is going on near them. How much money is being spent and on what projects. It would allow them to see what their elected officials are voting for and brings responsibility, traceability and transparency to a system that the public can feel so divorced from. 

## Notes

### Set-up Information

We have provided a zipped file which contains the project's documents for your ease, including .env files for handling some more sensitive values.

If you would prefer, you can clone the repo for the code which is described in the SETUP_README.md file in this Zip.

If you do clone the repository, you will need to create these .env files yourself and fill specific variables with specific values which are described in the setup readme.

We utilise a Node.js server to act as a middle-man between the contract and the front-end. 

We utilise a Create React App development server for handling the front-end, the use of which is described in the setup readme.

The react app routes to http://localhost:3000 but gets proxied by the node server to localhost:5000.

If you aren't running these two aspects, the website will be non-functioning.

### MetaMask

We are only accepting MetaMask as an injector/provider. We have allowed for you to switch MetaMask wallets while accessing the front-end and the front-end will switch to whatever is the current wallet.

If you already have an Ethereum address, you can import it into MetaMask.
Click on the account icon in the top right corner of MetaMask and select "Import Account".
Enter your private key from the private_key.txt file in the zip file

## Add Environment Variables

### 1. Create .env File

In the server folder, if there isn't already a .env file, create a file called .env and populate it with the contents in the environment.txt folder from the zip file

## Set up React Application

### 1. Navigate to Application Directory

To setup and connect to the React application, run the following 3 commands:

```sh
cd cryptotender
npm install
npm start
```

## Setup Node.js

### 1. Navigate to Server Directory

To setup and connect to the Node.js server, run the following 3 commands:

```sh
cd server
npm install
node server.js
```

## Login Details

The login details needed to test the application are stored in the login_details.txt file in the zip file.


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

We are only accepting MetaMask as an injector/provider. We have allowed for you to switch MetaMask wallets while accessing the front-end and the front-end will switch to whatever is the current wallet but <b>you will need to refresh the page</b> to get it to work, as the account setting is handled on webpage load and we had too many difficulties getting it to run dynamically.

Bear in mind that if you were to fulfil Admin actions, you need to be connected on MetaMask with a wallet already approved as an Admin. Even registering an account requires Admin privileges.

To resolve this, we have provided the private key to a throw-away wallet with some Sepolia Eth to the .env files for you to import into your MetaMask account so that you can always have access to an Admin account.

You can register new accounts, but there are some front-end/back-end inconsistencies for non-admin users, as the project was developed with the focus on admin accounts in mind.

The inconsistencies for non-admin accounts mostly consist of the front-end allowing you to do actions which non-admin roles may not have permissions to fulfill. This will allow you to send a high-gas transaction to the contract which will get rejected on a permissions basis.

### General

Ideally, this project would be dealing with the millions of £ GBP worth of ETH but given our development and faucet constraints, we couldn't create tenders to represent this large of a value. We have, however, multiplied the displayed values of the table by 1 million to give the sense of impact we intend to be represented by a realistic deployment of our idea.
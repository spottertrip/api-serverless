# Spotter Serverless API Project

## Requirements

Node.js, npm, yarn and serverless dependencies:
```bash
npm install -g yarn
yarn -g serverless
```

## How to use

You will need to install multiple dependencies in order to run the API Locally.

```bash
# install dependencies
yarn
```

As this projects uses `AWS DynamoDB` as a Database, we may use [Serverless DynamoDB Local](https://www.npmjs.com/package/serverless-dynamodb-local) plugin to emulate DynamoDB locally.
You have to run the following command to initialize local database:
```bash
serverless dynamodb install
```

And run:
```bash
yarn dev
```

## Useful Links:

- [Live Documentation](http://51.158.103.2/) Generated with [Serverless AWS Documentation](https://github.com/deliveryhero/serverless-aws-documentation) plugin (Uploads generated doc to AWS APIGateway, we may then download it in multiple formats like Postman or OpenAPI/Swagger).
- [Database Schema](https://github.com/spottertrip/api-serverless/wiki/Database-Architecture)
- [General Documentation about this project](https://github.com/spottertrip/api-serverless/wiki) 
- [Backlog for MVP](https://github.com/spottertrip/api-serverless/projects/1) - Issues and Pull Requests

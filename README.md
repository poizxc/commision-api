
## Description


- This is API build in nest js for [commision-calculation-app-front](https://github.com/poizxc/commision-calculation-app-front),

- it have only one route which is [POST] /commisions/calculate,

- it have validation for incoming request,

- it uses BigNumber.js to hanlde floating points number corectly,

- it supports currency exchange, but I limited the usage to only 3 of them USD, EUR and PLN, if you have some tests that uses other currencies you can update the enum in './src/commisions/types.ts', exchange rates comes from 2021-01-01 - because task description says that it should use this exact day,

- tests are included. 


## example request 

```bash
curl -d '{ "date": "2021-01-01", "amount": "100.00", "currency": "EUR", "client_id": 42 }' -H "Content-Type: application/json" -X POST http://localhost:8080/commisions/calculate

```
## Techstack

- Nestjs
- jest
- typescript
- BigNumber.js
## Installation

```bash
$ npm install
```

or

```bash
$ yarn install
```
## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

or 

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```
## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

or


```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
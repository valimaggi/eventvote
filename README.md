# Eventvote

App for event scheduling with voting. So far there is only the backend REST API.

#### What's next/missing? (in no order)
* Better data validation for the request body objects (for example dates)
* Data validation (schemas) for the response body objects
* More comprehensive API tests
* Validation for app-specific environment variables
* Support for another ODM than Mongoose, one which does not use promises
* Frontend
* Authentication (JWT)
* Deploy to Heroku or whatever

#### Project structure

Guideline is "by feature" so there are no folders for routes, models etc. separately. All these modules are under each feature. In the current scope, it's pretty useless, because there's only one feature, but this is also intended to be a base project structure for larger projects for me.

## Install

`yarn install` or `npm install`

Prefer yarn as there are no shrinkwrap used in this project (yarn provides yarn.lock).

## Start

`npm start`

## Tests

`npm test` to run all the tests

`npm test watch` to run tests constantly after every file change

## Usage

### General

Use the .env file to set the custom environment variables. All of these all required:

`DB_ODM` Object Document Mapper for MongoDB to be used, for now only 'mongoose' is supported
`DB_URI`
`DB_USER`
`DB_PASS`
`SERVER_PORT`

### API

#### List all events
Endpoint: `/api/v1/event/list`

##### Request
Method: `GET`

##### Response
Body:

```
{
  "events": [
    {
      "id": 0,
      "name": "Kalle's birthday"
    },
    {
      "id": 1,
      "name": "Ninja party"
    },
    {
      "id": 2,
      "name": "Boardgame night"
    }
  ]
}
```

#### Create an event
Endpoint: `/api/v1/event`

##### Request
Method: `POST`

Body:

```
{
  "name": "Ninja party",
  "dates": [
    "2017-01-01",
    "2017-01-05",
    "2017-01-12"
  ]
}
```

##### Response
Body:

```
{
  "id": 0
}
```

#### Show an event
Endpoint: `/api/v1/event/{id}`

##### Request
Method: `GET`

Parameters: `id`, `long`

##### Response
Body:

```
{
  "id": 0,
  "name": "Ninja party",
  "dates": [
    "2014-01-01",
    "2014-01-05",
    "2014-01-12"
  ],
  "votes": [
    {
      "date": "2017-01-01",
      "people": [
        "Vilma",
        "Juuso",
        "Jesse",
        "Emmi"
      ]
    }
  ]
}
```

#### Add votes to an event
Endpoint: `/api/v1/event/{id}/vote`

##### Request
Method: `POST`

Parameters: `id`, `long`

Body:

```
{
  "name": "Joonas",
  "votes": [
    "2014-01-01",
    "2014-01-05"
  ]
}
```

##### Response

```
{
  "id": 0,
  "name": "Ninja party",
  "dates": [
    "2017-01-01",
    "2017-01-05",
    "2017-01-12"
  ],
  "votes": [
    {
      "date": "2017-01-01",
      "people": [
        "Pauliina",
        "Joonas",
        "Sonja",
        "Jonne",
        "Sami"
      ]
    },
    {
      "date": "2014-01-15",
      "people": [
        "Miikka"
      ]
    }
  ]
}
```

#### Show the results of an event
Endpoint: `/api/v1/event/{id}/results`
Responds with dates that are **suitable for all participants**.

##### Request
Method: `GET`

Parameters: `id`, `long`

##### Response

```
{
  "id": 0,
  "name": "Ninja party",
  "suitableDates": [
    {
      "date": "2017-01-01",
      "people": [
        "Pauliina",
        "Joonas",
        "Sonja",
        "Jonne",
        "Sami"
      ]
    }
  ]
}
```

#### Delete all events
Endpoint: `/api/v1/event`
No response, just deleting all the events.

##### Request
Method: `DELETE`

##### Response

```
No response
```

## License

MIT.

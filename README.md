# Eventvote

App for event scheduling with voting. So far there is only the backend REST API.

## Install

`yarn install` or `npm install`

## Start

`npm start`

## Tests

`npm test` to run all the tests

`npm test watch` to run tests after every file change

## Usage

### General

Use the .env file to set the config props like server port and your MongoDB URI and credentials.

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

# BookingGuru App

A backend service built with NestJS Framework for city and pollution data aggregation.

## Features

- Fetches city and pollution data using CQRS design pattern. 
- Integrates with Wikipedia, country service, and pollution APIs.
- Uses Express Framework as the HTTP platform
- Supports validation and transformation with class-validator and class-transformer

## Scripts

- `npm install` - Install required dependency
- `npm start` — Start the application
- `npm run build` — Build the application

## Dependencies

- **NestJS Core:** `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/cqrs`, `@nestjs/config`, `@nestjs/axios`
- **HTTP Client:** `axios`
- **Validation:** `class-validator`, `class-transformer`
- **Express:** `express`

## Dev Dependencies

- **TypeScript:** `typescript`
- **Type Definitions:** `@types/express`
- **TS Node:** `ts-node`, `ts-node-dev`

## Getting Started

create `.env` file in same level as package.json file.

COUNTRIES_NOW_API_BASE_URL=<https://countriesnow.space>
MOCK_API_URL=<https://be-recruitment-task.onrender.com>
WIKIPEDIA_API_BASE_URL=<https://en.wikipedia.org>`


1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the application:

   ```bash
   npm start
   ```

## APIs

Fetches a list of cities for a given country, with optional pagination.

`GET /api/cities`

### curl
curl -X GET "<http://localhost:3000/api/cities?countryCode=FR&limit=5&page=1>" \
  -H "Authorization: Bearer your_token_here"
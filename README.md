# OptiFunder Assessment

## Departure Board - MBTA Commuter Rail

## Installation/Setup

1. Download the code from Github or clone the repository.
2. Change directory so you are in the main project directory
```
cd OptiFunderAssessment
```
3. Create a file called .env 
4. Add the following fields to the file
```
API_TOKEN=your-api-token-here
VUE_APP_BACKEND_URL=http://localhost:5000/
```
5. Be sure to add your api token for the MBTA api where it says "your-api-token-here".

## Running the App

1. Build the application using docker-compose
```
docker-compose build
```
2. Run the application with docker-compose
```
docker-compose up
```
3. Access the client application at http://localhost:8080/

- Note. The backend of this application will run at localhost:5000/

## Project Notes
1. South Station is the default stop
2. Departed statuses will not be removed automatically. I am not sure what the rules are about this so a page refresh will take care of it
3. The stream gets predictions and if there are no predictions, it will attempt to use schedules. Ex: if it is really late at night there won't be any departures until morning. It will show the schedule if possible.
 
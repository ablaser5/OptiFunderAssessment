from flask import Flask, Response
from flask_cors import CORS
import requests
from api import API
import os
from datetime import datetime, timezone, timedelta
import json

app = Flask(__name__)
mbta = API(os.getenv('API_TOKEN'))
CORS(app)

@app.route("/get_stops", methods=["GET"])
def get_stops():
    """Gets all of the stops for the commuter rails"""
    data = mbta.stops \
        .fetch_all()  \
        .filter_by('route', 'CR-Fairmount,CR-Worcester,CR-Franklin,CR-Greenbush,CR-Kingston,CR-Middleborough,CR-Needham,CR-Providence,CR-Foxboro,CR-Fitchburg,CR-Haverhill,CR-Lowell,CR-Newburyport') \
        .fetch()
    return {"stops": data}

@app.route("/get_time", methods=["GET"])
def get_time():
    """Gets the current server time in local time"""
    return {"time": datetime.now(timezone.utc).isoformat()}

@app.route('/stream/<string:stop_id>')
def stream(stop_id):
    """Data stream to access live data from the MBTA api"""
    def event_stream(url, headers=None):
        """Generator to yield events from the server."""
        with requests.get(url, headers=headers, stream=True) as response:
            event = None
            data = None
            for line in response.iter_lines():
                if line:  # filter out keep-alive lines
                    decoded = line.decode('UTF-8')
                    if 'event: ' in decoded:
                        event = decoded.split('event: ')[1]
                    if 'data: ' in decoded:
                        data = decoded.split('data: ')[1]

                    if event and data:
                        yield f"event: {event}\ndata: {data}\n\n"
                        event = None
                        data = None
    url = f"https://api-v3.mbta.com/predictions/?filter[stop]={stop_id}&filter[route_type]=2&filter[direction_id]=0&include=schedule,trip,stop"
    headers = {"Accept": "text/event-stream", "x-api-key": os.getenv('API_TOKEN')}
    return Response(event_stream(url, headers=headers), mimetype='text/event-stream')
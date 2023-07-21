import requests
import time

class API:
    """
    A class used to interact with the MBTA API.

    Attributes
    ----------
    token : str
        An authorization token for the MBTA API.
    base_url : str
        The base url for the MBTA API.
    max_retries : int
        The maximum number of retries if a request fails.
    failure_delay : int
        The delay (in seconds) before retrying a failed request.
    session : requests.Session
        The session used for making requests.
    lines : Lines
        A resource for interacting with the lines endpoint.
    predictions : Predictions
        A resource for interacting with the predictions endpoint.
    routes : Routes
        A resource for interacting with the routes endpoint.
    schedules : Schedules
        A resource for interacting with the schedules endpoint.
    stops : Stops
        A resource for interacting with the stops endpoint.
    trips : Trips
        A resource for interacting with the trips endpoint.
    """
    def __init__(self, auth_token, max_retries=3, failure_delay=1):
        self.token = auth_token
        self.base_url = "https://api-v3.mbta.com/"
        self.max_retries = max_retries
        self.failure_delay = failure_delay
        self.session = requests.Session()
        if auth_token:
            self.session.headers.update({'x-api-key': f'{auth_token}'})

        self.lines = Lines(self)
        self.predictions = Predictions(self)
        self.routes = Routes(self)
        self.schedules = Schedules(self)
        self.stops = Stops(self)
        self.trips = Trips(self)

    def request(self, method, endpoint, **kwargs):
        url = f'{self.base_url.rstrip("/")}/{endpoint.lstrip("/")}'
        for _ in range(self.max_retries):
            response = self.session.request(method, url, **kwargs)
            if response.status_code == 429:  # Rate limit error
                print("Rate limit reached. Retrying...")
                time.sleep(self.failure_delay)
                continue
            elif response.status_code >= 500: # Server error
                print("Server error. Retrying...")
                time.sleep(self.failure_delay)
                continue
            elif response.status_code >= 400: # Client error
                raise Exception(f'Request failed with status {response.status_code}')
            else:
                return response.json()
        raise Exception('Max retries exceeded')

class APIResource:
    """
    A base class for interacting with specific endpoints of the MBTA API.

    Attributes
    ----------
    api : API
        An instance of the API class.
    endpoint : str
        The endpoint of the API this class interacts with.
    id : str, optional
        The ID of the specific resource to fetch.

    Methods
    -------
    fetch():
        Fetches the resource with the provided ID.
    fetch_all():
        Returns an instance of Chainable for chainable filtering and sorting.
    """
    def __init__(self, api, endpoint, id=None):
        self.api = api
        self.endpoint = endpoint
        self.id = id

    def fetch(self):
        if self.id:
            return self.api.request('GET', f'{self.endpoint}/{self.id}')
        else:
            raise Exception('Resource ID not provided')
        
    def fetch_all(self):
        return Chainable(self)
        
class Chainable:
    """
    A class for chainable filtering, sorting, and pagination of API resources.

    Attributes
    ----------
    resource : APIResource
        The resource to be filtered, sorted, or paginated.
    params : dict
        The parameters to be sent with the GET request.

    Methods
    -------
    filter_by(filter_name: str, value: Any) -> 'Chainable':
        Adds a filter parameter.
    include(field_name: str) -> 'Chainable':
        Includes a related resource in the response.
    page_by(page_type: str, value: Any) -> 'Chainable':
        Sets a pagination parameter.
    sort_by(sort_name: str) -> 'Chainable':
        Sets the sort parameter.
    fetch() -> dict:
        Fetches resources according to the specified parameters.
    """
    def __init__(self, resource):
        self.resource = resource
        self.params = {}

    def filter_by(self, filter_name, value):
        self.params[f'filter[{filter_name}]'] = value 
        return self

    def include(self, field_name):
        self.params['include'] = field_name
        return self
    
    def page_by(self, page_type, value):
        self.params[f'page[{page_type}]'] = value
        return self
    
    def sort_by(self, sort_name):
        self.params['sort'] = sort_name
        return self
    
    def fetch(self):
        return self.resource.api.request('GET', self.resource.endpoint, params=self.params)

class Lines(APIResource):
    def __init__(self, api, id=None):
        endpoint = 'lines'
        super().__init__(api, endpoint, id)

class Predictions(APIResource):
    def __init__(self, api, id=None):
        endpoint = 'predictions'
        super().__init__(api, endpoint, id)

class Routes(APIResource):
    def __init__(self, api, id=None):
        endpoint = 'routes'
        super().__init__(api, endpoint, id)

class Schedules(APIResource):
    def __init__(self, api, id=None):
        endpoint = 'schedules'
        super().__init__(api, endpoint, id)

class Stops(APIResource):
    def __init__(self, api, id=None):
        endpoint = 'stops'
        super().__init__(api, endpoint, id)

class Trips(APIResource):
    def __init__(self, api, id=None):
        endpoint = 'trips'
        super().__init__(api, endpoint, id)

    
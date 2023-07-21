/**
 * Manages an EventSource connection and associated listeners.
 * @class
 */
class EventSourceManager {
  /**
   * Creates a new EventSourceManager instance.
   * @constructor
   */
  constructor() {
    this.eventSource = null;
    this.eventListeners = {};
  }

  /**
   * Establishes an EventSource connection for the given stopId and sets up event listeners.
   * If a connection already exists, it will be closed and then a new one will be created after
   * @param {string} stopId - The ID of the stop for use in the server endpoint
   */
  connect(stopId) {
    // Close existing event source if there is one
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // Initialize a new event source
    const url = `${process.env.VUE_APP_BACKEND_URL}/stream/${stopId}`;
    this.eventSource = new EventSource(url);
    
    this.eventSource.onmessage = (event) => {
      console.log(event);
    };

    // Close on error
    this.eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      this.eventSource.close();
    };

    // Add all the event listeners for the events coming from the server
    ['reset', 'add', 'remove', 'update'].forEach((eventType) => {
      this.eventSource.addEventListener(eventType, (event) => {
        if (this.eventListeners[eventType]) {
          this.eventListeners[eventType](event);
        }
      });
    });
  }

  /**
   * Registers a new event listener for a given event type.
   * If a listener for this event type already exists, it will be overwritten.
   * @param {string} eventType - The type of the event to listen for.
   * @param {Function} callback - The function to call when the event is fired.
   */
  registerEventListener(eventType, callback) {
    this.eventListeners[eventType] = callback;
  }

  /**
   * Unregisters the event listener for a given event type.
   * If no listener for this event type is registered, this method does nothing.
   * @param {string} eventType - The type of the event to stop listening for.
   */
  unregisterEventListener(eventType) {
    delete this.eventListeners[eventType];
  }

  /**
   * Closes the current EventSource connection if it exists.
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

/**
 * Singleton instance of EventSourceManager.
 * @type {EventSourceManager}
 */
export const eventSourceManager = new EventSourceManager();
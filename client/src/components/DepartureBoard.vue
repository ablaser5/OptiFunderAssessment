<template>
    <div id="departure-board">
      <section id="top">
        <div class="dt-container" id="date">
          <p>{{ currentWeekday() }}</p>
          <p>{{ currentDate() }}</p>
        </div>
        <div id="station">
          <select v-model="selectedStop" id="all-stops">
            <option v-for="stop in sortedStopData" :value="stop.id" :key="stop.id">{{ stop.attributes.name }}</option>
          </select>
        </div>
        <div class="dt-container" id="time">
          <p>CURRENT TIME</p>
          <p>{{ dateToTime(time) }}</p>
        </div>
      </section>
      <div v-if="error">
        <p>Error: {{ error }}</p>
      </div>
      <div v-if="sortedBoardData.length === 0">
        No Data
      </div>
      <div v-if="isLoading" id="loading">
        Loading...
      </div>
      <div v-else>
        <table id="information">
          <thead>
            <th>CARRIER</th>
            <th>TIME</th>
            <th>DESTINATION</th>
            <th>TRAIN#</th>
            <th>TRACK#</th>
            <th>STATUS</th>
          </thead>
          <tbody>
            <tr v-for="data of sortedBoardData" :key="data.id">
              <td>MBTA</td>
              <td>{{ dateToTime(data.attributes.departure_time) }}</td>
              <td>{{ trips[data.relationships.trip.data.id].attributes.headsign }}</td>
              <td>{{ trips[data.relationships.trip.data.id].attributes.name }}</td>
              <td>{{ stops[data.relationships.stop.data.id].attributes.platform_code || "TBD" }}</td>
              <td class="status">{{ data.attributes.status || 'On Time' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, onBeforeUnmount, watch} from 'vue'
import { dateToTime, currentDate, currentWeekday } from '../utils/dateHelpers.js'
import { loadData, removeData, updateData, sortBoardData, sortStopData } from '../utils/dataProcessing.js'
import { eventSourceManager } from '../services/EventSourceManager.js'
import { useStore } from 'vuex'

export default {
  name: 'DepartureBoard',
  setup() {
    const store = useStore();
    const timer = ref(null);
    const error = ref(null);
    const isLoading = ref(true);
    const sortedBoardData = ref([]);
    const sortedStopData = ref([]);
    const time = computed(() => store.state.time);
    const boardData = computed(() => store.state.board_data);
    const schedules = computed(() => store.state.schedules);
    const stops = computed(() => store.state.stops);
    const allStops = computed(() => store.state.all_stops);
    const trips = computed(() => store.state.trips);
    const selectedStop = ref('place-sstat');
    let serverTimeOffset = 0;

    /**
     * Starts updating the time so that it is always accurate
     */
    const startUpdatingTime = async () => {
      timer.value = setInterval(() => {
        let localTime = new Date();
        let correctedTime = new Date(localTime.getTime() + serverTimeOffset);
        store.commit('setTime', correctedTime);
      }, 1000);
    };

    /**
     * Syncs the time from the server with what the client sees
     */
    const syncTimeWithServer = async () => {
      let serverTime = await store.dispatch('getTime');
      let localTime = new Date();
      serverTimeOffset = serverTime - localTime;
    };


    /**
     * Handles server events by parsing the event data and sorting the board data.
     *
     * @param {string} eventData - The event data as a JSON string.
     * @param {string} actionType - The type of action to dispatch.
     */
    const handleServerEvent = (eventData, actionType) => {
      try {
        const data = JSON.parse(eventData);
        if (actionType === 'reset') {
          for (const d of data) {
            loadData(store, d);
          }
        } else if (actionType === 'add') {
          loadData(store, data);
        } else if (actionType === 'remove') {
          removeData(store, data);
        } else {
          updateData(store, boardData, data);
        }
        sortedBoardData.value = sortBoardData(boardData.value);
      } catch (err) {
        console.error('Error parsing event data:', err);
      }
    };
    
    eventSourceManager.registerEventListener('reset', (event) => {
      handleServerEvent(event.data, 'reset');
    });

    eventSourceManager.registerEventListener('add', (event) => {
      handleServerEvent(event.data, 'add');
    });

    eventSourceManager.registerEventListener('remove', (event) => {
      handleServerEvent(event.data, 'remove');
    });

    eventSourceManager.registerEventListener('update', (event) => {
      handleServerEvent(event.data, 'update');
    });

    // Listen for changes in the selectedStop so we can connect to a new stream
    watch(selectedStop, (newStopId) => {
      store.commit('resetBoardData');
      eventSourceManager.connect(newStopId);
    });

    onMounted(async () => {
      try {
        await store.dispatch('getTime');
        await store.dispatch('getAllStops');
        await syncTimeWithServer();
        startUpdatingTime();
        setInterval(syncTimeWithServer, 60000);
        sortedStopData.value = sortStopData(allStops.value);
        eventSourceManager.connect(selectedStop.value);
      } catch (err) {
        error.value = "Failed to load data. Please try again later.";
      } finally {
        isLoading.value = false;
      }
  })

    onUnmounted(() => {
      clearInterval(timer.value);
    })

    onBeforeUnmount(() => {
      eventSourceManager.unregisterEventListener('reset');
      eventSourceManager.unregisterEventListener('add');
      eventSourceManager.unregisterEventListener('remove');
      eventSourceManager.unregisterEventListener('update');
      eventSourceManager.disconnect();
    });
  
    return { time, dateToTime, currentDate, currentWeekday, sortedBoardData, trips, stops, schedules, sortedStopData, selectedStop, error, isLoading }
  },
}

</script>

<style scoped>
@font-face {
  font-family: 'LED Dot Matrix';
  src: url('../assets/LED-Dot-Matrix.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

#departure-board {
    width: 1080px;
    background-color: black;
    font-family: 'LED Dot Matrix', sans-serif;
}

#top {
  width: 100%;
  height: 100px;
  position: relative;
}

.dt-container {
  width: auto;
  color: rgb(255, 187, 0);
  position: absolute;
  font-size: 24px;
}

.dt-container p {
  margin: 0;
  margin-bottom: 5px;
}

#date {
  top: 15px;
  left: 15px;
  text-align: left;
}

#time {
  top: 15px;
  right: 15px;
  text-align: right;
}

#station {
  width: 40%;
  height: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(187, 187, 187);
  text-align: center;
  font-size: 28px;
}

#station p {
  margin: 0;
  margin-top: 15px;
  font-family: Arial, Helvetica, sans-serif;
}

#information {
  width: 100%;
}

thead {
  color: rgb(187, 187, 187);
  font-family: Arial, Helvetica, sans-serif;
}

th {
  text-align: left;
  padding-left: 15px;
}

td {
  color: orange;
  padding-left: 15px;
  font-size: 20px;
}
.status {
  color: #27cd00;
}

#all-stops {
  width: auto;
  height: 40px;
  text-align: left;
  font-size: 24px;
  background-color: #2d2d2d;
  color: white;
  margin-top: 15px;
}

#loading {
  color: white;
  font-size: 24px;
  text-align: center;
  padding-bottom: 25px;
}
</style>
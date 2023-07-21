import { createStore } from 'vuex'

export default createStore({
  state: {
    board_data: {},
    schedules: {},
    stops: {},
    all_stops: {},
    trips: {},
    time: null,
  },
  getters: {
    
  },
  mutations: {
    addSchedule(state, schedule) {
      state.schedules[schedule.id] = schedule;
    },
    addStop(state, stop) {
      state.stops[stop.id] = stop;
    },
    addTrip(state, trip) {
      state.trips[trip.id] = trip;
    },
    addBoardData(state, data) {
      state.board_data[data.id] = data;
    },
    updateBoardData(state, { field, data }) {
      state.board_data[data.id].attributes[field] = data.attributes[field];
    },
    removeBoardData(state, data) {
      delete state.board_data[data.id];
    },
    removeSchedule(state, schedule) {
      delete state.schedules[schedule.id];
    },
    removeTrip(state, trip) {
      delete state.trips[trip.id];
    },
    removeStop(state, stop) {
      delete state.stops[stop.id];
    },
    resetState(state) {
      state.board_data = {};
      state.stops = {};
      state.schedules = {};
      state.trips = {};
    },
    resetBoardData(state) {
      state.board_data = {};
    },
    setAllStops(state, stops) {
      for (const stop of stops) {
        state.all_stops[stop.id] = stop;
      }
    },
    setTime(state, time) {
      state.time = time;
    }
  },
  actions: {
    async getAllStops({commit}) {
      try {
        const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/get_stops`);
        if (!response.ok) { 
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          const data = await response.json();
          commit('setAllStops', data["stops"]["data"]);
          return data;
        }
      } catch (error) {
        console.error('Failed to fetch stops:', error);
        throw error;
      }
    },
    async getTime({commit}) {
      try {
        const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/get_time`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          const data = await response.json();
          let date = new Date(data.time);
          commit('setTime', date);
          return date
        }
      } catch (error) {
        console.error('Failed to fetch time:', error);
        throw error;
      }
    }
  }
})
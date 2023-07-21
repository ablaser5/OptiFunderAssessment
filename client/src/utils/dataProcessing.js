/**
 * Sorts an object's values by their 'departure_time' attribute.
 *
 * @param {object} data - The original data.
 * @returns {Array} - The sorted values of `data`.
 */
const sortBoardData = (data) => {
  let sortedData = Object.values(data);
  sortedData.sort((a, b) => {
    return a.attributes.departure_time.localeCompare(b.attributes.departure_time);
  });
  return sortedData;
}

/**
 * Sorts an object's values by their 'name' attribute.
 *
 * @param {object} data - The original data.
 * @returns {Array} - The sorted values of `data`.
 */
const sortStopData = (data) => {
  let sortedStops = Object.values(data);
  sortedStops.sort((a, b) => a.attributes.name.localeCompare(b.attributes.name));
  return sortedStops;
}

/**
 * Loads new data into the store for several types of data
 * @param {object} store - the vuex data store to add the data to
 * @param {object} d - the data to be loaded into the store
 */
const loadData = (store, d) => {
  if (d.type === 'schedule') {
    store.commit('addSchedule', d);
  } else if (d.type === 'trip') {
      store.commit('addTrip', d);
  } else if (d.type === 'stop') {
      store.commit('addStop', d);
  } else {
    if (d.attributes.departure_time) { // Only add if there is a departure time
      store.commit('addBoardData', d);
    }
  }
}

/**
 * Removes data from the store
 * @param {object} store - the vuex data store to remove data from
 * @param {object} d - the data to be removed
 */
const removeData = (store, d) => {
  if (d.type === 'schedule') {
    store.commit('removeSchedule', d);
  } else if (d.type === 'trip') {
    store.commit('removeTrip', d);
  } else if (d.type === 'stop') {
    store.commit('removeStop', d);
  } else {
    store.commit('removeBoardData', d);
  }
}

/**
 * Updates existing data
 * - Schedules, Trips, and Stops can just be overwritten
 * - Predictions require more info based on status 
 * @param {object} store - the vuex data store to update data in
 * @param {object} boardData - all board data
 * @param {object} d - the data to be updated
 */
const updateData = (store, boardData, d) => {
  if (d.type === 'schedule') {
    store.commit('addSchedule', d);
  } else if (d.type === 'trip') {
    store.commit('addTrip', d);
  } else if (d.type === 'stop') {
    store.commit('addStop', d);
  } else {
    const current = boardData.value[d.id];
    if (d.attributes.departure_time) {
      store.commit('addBoardData', d);
    } else {
      if (current) {
        store.commit('updateBoardData', {field:'status', data:d});
        if (current.attributes.departure_time && d.attributes.status === 'Departed') {
          let now = new Date().getTime();
          let previous = Date.parse(current.attributes.departure_time);
          let difference_milliseconds = now - previous;
          let difference_minutes = Math.round(difference_milliseconds / 1000 / 60);
          if (difference_minutes >= 5) {
            store.commit('removeBoardData', current);
          }
        }
      }
    }
  }
}

export {
  sortBoardData,
  sortStopData,
  loadData,
  removeData,
  updateData
}

<template>
  <div id="tfl-tube">
    <h1 class="d-lg-none">London Underground</h1>
    <div class="row mt-lg-3">
      <!-- search panel -->
      <div id="search" class="col-lg-6" style="padding-right:20px; border-right: 1px solid rgba(0, 0, 0, 0.1);">
        <!-- options: search by line or by station -->
        <ul class="nav nav-pills nav-fill">
          <li class="nav-item">
            <span
              class="nav-link"
              :class="{ active: searchByLineActive }"
              @click="activateSearchByLine"
            >
              Search by line
            </span>
          </li>
          <li class="nav-item">
            <span
              class="nav-link"
              :class="{ active: searchByStationActive }"
              @click="activateSearchByStation"
            >
              Search by station
            </span>
          </li>
        </ul>

        <hr/>

        <!-- search by line -->
        <div v-if="searchByLineActive" id="lines" class="mt-2">
          <div class="row">

            <!-- label -->
            <div class="col-xl-6">
              <p><strong>Select a line</strong></p>
            </div>

            <!-- show/hide results button -->
            <div class="col-xl-6 mt-3 mt-xl-0">
              <button
                class="btn btn-secondary form-control"
                @click="linesListShow = !linesListShow"
              >
                Show/hide lines
              </button>
            </div>
          </div>

          <!-- search by line results -->
          <ul v-if="linesListShow" class="list-group list-group-flush">
            <li
              class="list-group-item"
              v-for="(name, id) in lines"
              :key="id"
              @click="setLine(id)"
            >
              <strong class="px-2 py-1" :class="id">{{name}}</strong>
              <mark>{{ id }}</mark>
            </li>
          </ul>
        </div>

        <!-- stations on line -->
        <div id="line-stations">
          <!-- stations on line form -->
          <div class="form-group" v-if="lineStationsShow" id="line-stations-results">
            <hr/>
            <div class="row">

              <!-- label -->
              <div class="col-xl-6">
                <p><strong>Select a station on {{ currentLineFriendlyName }} line</strong></p>
              </div>

              <!-- spinner and show/hide results button -->
              <div class="col-xl-6 mt-3 mt-xl-0">
                <div
                  v-if="lineStationsListLoading"
                  class="d-flex align-items-center"
                >
                  <strong>Loading...</strong>
                  <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                </div>

                <button
                  v-if="!lineStationsListLoading"
                  class="btn btn-secondary form-control"
                  @click="lineStationsListShow = !lineStationsListShow"
                >
                  Show/hide stations
                </button>
              </div>
            </div>
          </div>

          <!-- stations on line list -->
          <ul class="list-group list-group-flush" v-if="lineStationsListShow">
            <li
              class="list-group-item"
              v-for="(stationData, stationId) in lineStations"
              :key="stationId"
              @click="setStation(stationId)"
            >
                {{stationData.name}} <mark>{{ stationId }}</mark>
            </li>
          </ul>
        </div>

        <!-- search by station -->
        <div v-if="searchByStationActive" id="station-search" class="mt-2">
          <!-- search by station form -->
          <div class="form-group">
            <div class="row">
              <div class="col-xl-6">
                <input
                  class="form-control"
                  v-model="stationNameQuery"
                  placeholder="station name"
                  @input="callDebounceStationSearch"
                >
              </div>

              <!-- spinner and show/hide results button -->
              <div class="col-xl-6 mt-3 mt-xl-0">
                <div
                  v-if="stationsListLoading && !stationsShow"
                  class="d-flex align-items-center"
                >
                  <strong>Loading...</strong>
                  <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                </div>
                <button
                  v-if="stationsShow"
                  type="button" class="form-control btn btn-secondary mt-3 mt-xl-0"
                  @click="stationsListShow = !stationsListShow"
                >
                  Show/hide results
                </button>
              </div>
            </div>
          </div>

          <!-- search by station results -->
          <div v-if="stationsListShow" id="stations-list">
            <p><strong>Select a station</strong></p>
            <ul class="list-group list-group-flush">
              <template v-for="(stationData, stationId) in stations">
                <li
                  v-for="lineId in stationData.lines"
                  class="list-group-item"
                  :key="lineId + ' ' + stationId"
                  @click="setLineAndStation(lineId, stationId)"
                >
                  <span class="px-2 py-1" :class="lineId">{{ stationData.name }}</span>
                  <mark>{{ lineId }} / {{ stationId }}</mark>
                </li>
              </template>
            </ul>
          </div>
        </div>  <!-- end search panel -->

        <!-- directions -->
        <div v-if="directionsShow" id="directions">
          <hr/>

          <div class="row">
            <!-- label -->
            <div class="col-xl-6">
              <p><strong>Select a direction for {{ currentLineDirectionsFriendlyName }} line</strong></p>
            </div>

            <!-- spinner -->
            <div class="col-xl-6 mt-3 mt-xl-0">
              <div
                v-if="directionsListLoading"
                class="d-flex align-items-center"
              >
                <strong>Loading...</strong>
                <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
              </div>
            </div>
          </div>

          <!-- directions list -->
          <ul v-if="directionsListShow" class="list-group list-group-flush">
            <li
              v-for="d in directions"
              class="list-group-item"
              :key="d"
              @click="
                direction = d;
                directionHasErrors = false;
                scrollToStart();
            ">
              {{ d }}
            </li>
          </ul>
        </div>

        <hr class="d-lg-none"/>

      </div>


      <!-- departures panel -->
      <div id="departures" class="col-lg-6">
        <div class="form-group">
          <label>Line ID</label>
          <input
            class="form-control"
            v-model="lineId"
            placeholder="e.g. district"
            @input="lineIdHasErrors = false;"
            @keyup.enter="startBoardClient"
            :class="{ 'is-invalid': lineIdHasErrors }"
          >
          <div class="invalid-feedback">
            {{ lineIdErrorMessage }}
          </div>
        </div>

        <div class="form-group">
          <label>Station ID on line</label>
          <input
            class="form-control"
            v-model="stationId"
            placeholder="e.g. 940GZZLUVIC"
            @input="stationIdHasErrors = false;"
            @keyup.enter="startBoardClient"
            :class="{ 'is-invalid': stationIdHasErrors }"
          >
          <div class="invalid-feedback">
            {{ stationIdErrorMessage }}
          </div>
        </div>

        <div class="form-group">
          <label>Direction</label>
          <input
            class="form-control"
            v-model="direction"
            placeholder="e.g. Westbound, Inner Rail"
            @input="directionHasErrors = false;"
            @keyup.enter="startBoardClient"
            :class="{ 'is-invalid': directionHasErrors }"
          >
          <div class="invalid-feedback">
            {{ directionErrorMessage }}
          </div>
        </div>

        <div class="form-group">
          <button
            @click="startBoardClient"
            type="button"
            class="btn btn-primary form-control"
            ref="start"
            :disabled="!lineId || !stationId || !direction"
          >
            ▶ Start board client
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { debounce } from 'lodash';

export default {
  name: 'TflTube',

  inject: ['notyf'],

  data() {
    return {
      // navigation
      searchByLineActive: true,
      searchByStationActive: false,

      // search forms
      lines: [],
      linesListShow: false,

      lineStations: [],
      lineStationsShow: false,
      lineStationsListLoading: false,
      lineStationsListShow: false,

      stationNameQuery: '',
      stations: [],
      stationsShow: false,
      stationsListShow: false,
      stationsListLoading: false,

      directions: [],
      directionsShow: false,
      directionsListLoading: false,
      directionsListShow: false,
      directionsLineId: '',

      currentLineFriendlyName: '',
      currentLineDirectionsFriendlyName: '',

      // board client parameters
      lineId: '',
      lineIdHasErrors: false,
      lineIdErrorMessage: '',

      stationId: '',
      stationIdHasErrors: false,
      stationIdErrorMessage: '',

      direction: '',
      directionHasErrors: false,
      directionErrorMessage: '',
    }
  },

  mounted() {
    // get lines
    this.axios
      .get('/tfl-tube/lines')
      .then(response => {
        this.lines = response.data;
        this.linesListShow = true;
      });
  },

  methods: {
    activateSearchByLine() {
      // ignore if already searching by line
      if (this.searchByLineActive) {
        return;
      }

      this.searchByLineActive = true;
      this.searchByStationActive = false;

      this.linesListShow = true;

      this.stationsShow = false;
      this.stationsListShow = false;

this.directionsShow = false;
    },

    activateSearchByStation() {
      if (this.searchByStationActive) {
        return;
      }

      this.searchByLineActive = false;
      this.searchByStationActive = true;

      this.stationNameQuery = '';

      this.linesListShow = false;
      this.lineStationsShow = false;
      this.lineStationsListShow = false;

      this.directionsShow = false;
    },

    callDebounceStationSearch: debounce(function(){
      this.stationSearch();
    }, 200), // wait for Xms after user has finished typing before searching

    stationSearch() {
      // ignore and hide search results if fewer than 2 characters
      if (this.stationNameQuery.length < 2) {
        return;
      }

      this.stationsListShow = false;
      this.stationsListLoading = true;

      // perform search
      this.axios
        .get('/tfl-tube/stations/' + this.stationNameQuery)
        .then(response => {
          this.stations = response.data
          this.stationsShow = true;
          this.stationsListLoading = false;
          this.stationsListShow = true;
        });
    },

    setLine(lineId) {
      this.lineId = lineId;
      this.lineIdHasErrors = false;
      this.stationId = '';
      this.stationIdHasErrors = false;
      this.direction = '';
      this.directionHasErrors = false;

      this.currentLineFriendlyName = this.lines[lineId];
      this.currentLineDirectionsFriendlyName = this.currentLineFriendlyName
      this.linesListShow = false;

      this.listLineStations(lineId);
      this.listLineDirections(lineId);
    },

    setStation(stationId) {
      this.stationId = stationId;
      this.stationIdHasErrors = false;

      this.linesListShow = false;
      this.lineStationsListShow = false;
    },

    setLineAndStation(lineId, stationId) {
      this.lineId = lineId;
      this.stationId = stationId;
      this.stationIdHasErrors = false;

      this.stationsListShow = false;
      this.listLineDirections(lineId);
    },

    listLineStations(lineId) {
      this.lineStationsShow = true;
      this.lineStationsListShow = false;
      this.lineStationsListLoading = true;

      this.axios
        .get('/tfl-tube/stations-line/' + lineId)
        .then(response => {
          this.lineStations = response.data;
          this.lineStationsListLoading = false;
          this.lineStationsListShow = true;
        });
    },

    listLineDirections(lineId) {
      this.directionsShow = true;

      // don't fetch if already displaying directions for requested line
      if (lineId == this.directionsLineId) {
        return;
      }

      this.directionsListShow = false
      this.directionsListLoading = true;
      this.axios
        .get('/tfl-tube/directions/' + lineId)
        .then(response => {
          this.directions = response.data;
          this.directionsLineId = lineId;
          this.directionsListLoading = false;
          this.directionsListShow = true;
        });
    },

    scrollToStart() {
      this.$refs.start.scrollIntoView();
    },

    startBoardClient() {
      // validate parameters
      var hasErrors = false
      this.lineIdHasErrors = false;
      this.stationIdHasErrors = false;
      this.directionHasErrors = false;

      if (this.lineId.length == 0) {
        this.lineIdErrorMessage = "Please enter a line ID";
        this.lineIdHasErrors = true;
        hasErrors = true;
      }
      if (this.stationId.length == 0) {
        this.stationIdErrorMessage = "Please enter a station ID";
        this.stationIdHasErrors = true;
        hasErrors = true;
      }
      if (this.direction.length == 0) {
        this.directionErrorMessage = "Please enter a direction";
        this.directionHasErrors = true;
        hasErrors = true;
      }

      if (hasErrors) {
        this.notyf.error("Please correct errors");
        return;
      }

      // start board client
      this.axios
        .post(
          '/tfl-tube/start-client',
          {
            'line_id': this.lineId,
            'station_id': this.stationId,
            'direction': this.direction,
          }
        )
        .then((response) => {
            if (response.data.status == "OK") {
              this.notyf.success("Showing departures for " + this.lineId + "/"
                + this.stationId + "/" + this.direction);
            }
            else if (response.data.status == "error") {
              this.notyf.error(this.stationId + ": " + response.data.message);
            }
          }
        );
    },
  },
}
</script>

<style scoped>
.bakerloo {
	color: white;
	background-color: rgb(178, 99, 0);
}

.hammersmith-city {
	color: black;
	background-color: rgb(244, 169, 190);
}

.piccadilly {
	color: white;
	background-color: rgb(0, 25, 168);
}

.central {
	color: white;
	background-color: rgb(220, 36, 31);
}

.jubilee {
	color: white;
	background-color: rgb(161, 165, 167);
}

.victoria {
	color: black;
	background-color: rgb(0, 152, 216);
}

.circle {
	color: black;
	background-color: rgb(255, 211, 41);
}

.metropolitan {
	color: white;
	background-color: rgb(155, 0, 88);
}

.waterloo-city {
	color: black;
	background-color: rgb(147, 206, 186);
}

.district {
	color: white;
	background-color: rgb(0, 125, 50);
}

.northern {
	color: white;
	background-color: rgb(0, 0, 0);
}
</style>
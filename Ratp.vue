<template>
  <div id="ratp">
    <h1 class="d-lg-none">RATP</h1>
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
        <div v-if="searchByLineActive" id="line-search" class="mt-2">
          <!-- search by line form -->
          <div class="form-group">
            <div class="row">
              <!-- line input -->
              <div class="col-xl-6">
                <input
                  class="form-control"
                  v-model="lineCodeQuery"
                  placeholder="line number"
                  @input="callDebounceLineSearch"
                >
              </div>

              <!-- spinner and show/hide results button -->
              <div class="col-xl-6 mt-3 mt-xl-0">
                <div
                  v-if="linesListLoading && !linesShow"
                  class="d-flex align-items-center"
                >
                  <strong>Loading...</strong>
                  <div class="spinner-border ml-auto" role="status" aria-hidden="true"></div>
                </div>
                <button v-if="linesShow"
                  type="button" class="form-control btn btn-secondary"
                  @click="linesListShow = !linesListShow"
                >
                  Show/hide results
                </button>
              </div>
            </div>
          </div>

          <!-- search by line results -->
          <div v-if="linesListShow" id="line-results">
            <p><strong>Select a line</strong></p>
            <ul class="list-group list-group-flush">
              <li
                class="list-group-item"
                v-for="line in lines"
                :key="line.id"
                @click="setLine(line)"
              >
                <img
                  v-if="line.image != ''"
                  :src="line.image"
                  :alt="line.reseau + ' ' + line.code"
                  :title="line.reseau + ' ' + line.code"
                >
                <strong v-if="line.image == ''">
                  [{{ line.reseau }} {{ line.code }}]
                </strong>
                {{line.name}}
                <mark>{{ line.id }}</mark>
              </li>
            </ul>
          </div>
        </div>

        <!-- stations on line -->
        <div id="line-stations">
          <!-- stations on line form -->
          <div v-if="lineStationsShow" id="line-stations-results">
            <hr/>
            <div class="row">

              <!-- label -->
              <div class="col-xl-6">
                <p><strong>Select a station on {{ currentLineFriendlyName }}</strong></p>
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
              v-for="station in lineStationsList"
              :key="station.line.id + ' ' + station.line_station_id"
              @click="setStation(station)"
            >
              {{station.name}} <mark>{{station.line_station_id}}</mark>
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
              <li
                v-for="station in stations"
                class="list-group-item"
                :key="station.line.id + ' ' + station.line_station_id"
                @click="setStation(station)"
              >
                <img
                  v-if="station.line.image != ''"
                  :src="station.line.image"
                  :alt="station.line.reseau + ' ' + station.line.code"
                  :title="station.line.reseau + ' ' + station.line.code"
                >
                <strong v-if="station.line.image == ''">
                  [{{ station.line.reseau }} {{ station.line.code }}]
                </strong>

                {{ station.name }} <mark>{{ station.line.id}} / {{ station.line_station_id }}</mark>
              </li>
            </ul>
          </div>
        </div>  <!-- end search panel -->

        <!-- directions -->
        <div v-if="directionsShow" id="directions">
          <hr/>

          <div class="row">
            <!-- label -->
            <div class="col-xl-6">
              <p><strong>Select a direction for {{ currentLineDirectionsFriendlyName }}</strong></p>
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
              v-for="(name, sens) in directions"
              class="list-group-item"
              :key="sens"
              @click="
                directionSens = sens;
                directionSensHasErrors = false;
                scrollToStart();
            ">
              {{ name }} <mark>{{ sens }}</mark> 
            </li>
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
            placeholder="e.g. RB, B195"
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
            v-model="lineStationId"
            placeholder="e.g. 15, 195_6418_6465"
            @input="lineStationIdHasErrors = false;"
            @keyup.enter="startBoardClient"
            :class="{ 'is-invalid': lineStationIdHasErrors }"
          >
          <div class="invalid-feedback">
            {{ lineStationIdErrorMessage }}
          </div>
        </div>

        <div class="form-group">
          <label>Direction</label>
          <input
            class="form-control"
            v-model="directionSens"
            placeholder="A/R"
            @input="directionSensHasErrors = false;"
            @keyup.enter="startBoardClient"
            :class="{ 'is-invalid': directionSensHasErrors }"
          >
          <div class="invalid-feedback">
            {{ directionSensErrorMessage }}
          </div>
        </div>

        <div class="form-group">
          <button
            @click="startBoardClient"
            type="button"
            class="btn btn-primary form-control"
            ref="start"
            :disabled="!lineId || !lineStationId || !directionSens"
          >
            ▶ Start board client
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
module.exports = {
  name: 'Ratp',

  data() {
    return {
      // navigation
      searchByLineActive: true,
      searchByStationActive: false,
      
      // search forms
      lineCodeQuery: '',
      lines: [],
      linesShow: false,
      linesListLoading: false,
      linesListShow: false,

      lineStationsShow: false,
      lineStations: [],
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

      lineStationId: '',
      lineStationIdHasErrors: false,
      lineStationIdErrorMessage: '',

      directionSens: '',
      directionSensHasErrors: false,
      directionSensErrorMessage: '',
    }
  },

  methods: {
    activateSearchByLine() {
      // ignore if already searching by line
      if (this.searchByLineActive) {
        return;
      }

      this.searchByLineActive = true;
      this.searchByStationActive = false;

      this.lineCodeQuery = '';
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
      this.linesShow = false;
      this.linesListShow = false;
      this.lineStationsShow = false;
      this.lineStationsListShow = false;
      this.directionsShow = false;
    },

    // from https://codepen.io/rabelais88/pen/yqQpMy
    callDebounceLineSearch: _.debounce(function(){
      this.lineSearch();
    }, 200), // wait for Xms after user has finished typing before searching

    lineSearch() {
      // ignore and hide search results if query is empty
      if (this.lineCodeQuery.length == 0) {
        return;
      }

      this.linesShow = false;
      this.linesListShow = false;
      this.linesListLoading = true;
      this.lineStationsShow = false;

      this.lineStationsListShow = false;
      this.directionsShow = false;

      // perform search
      axios
        .get('/ratp/lines-by-code/' + this.lineCodeQuery)
        .then(response => {
          this.lines = response.data;
          this.linesShow = true;
          this.linesListLoading = false;
          this.linesListShow = true;
        });
    },

    callDebounceStationSearch: _.debounce(function(){
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
      axios
        .get('/ratp/stations/' + this.stationNameQuery)
        .then(response => {
          this.stations = response.data
          this.stationsShow = true;
          this.stationsListLoading = false;
          this.stationsListShow = true;
        });
    },

    setLine(line) {
      this.lineId = line.id;
      this.lineIdHasErrors = false;
      this.lineStationId = '';
      this.lineStationIdHasErrors = false;
      this.directionSens = '';
      this.directionSensHasErrors = false;

      this.currentLineFriendlyName = line.reseau + ' ' + line.code;
      this.currentLineDirectionsFriendlyName = this.currentLineFriendlyName
      this.linesListShow = false;

      this.listLineStations(line.id);
      this.listLineDirections(line.id);
    },

    setStation(station) {
      if (this.lineId != station.line.id) {
        this.lineId = station.line.id;
        this.lineIdHasErrors = false;
        this.directionSens = ''; /* don't reset direction if station on same line */
        this.directionSensHasErrors = false;
      }
      this.lineStationId = station.line_station_id;
      this.lineStationIdHasErrors = false;

      this.linesListShow = false;
      this.lineStationsListShow = false;
      this.stationsListShow = false;
      
      this.currentLineFriendlyName = station.line.reseau + ' ' + station.line.code;
      this.currentLineDirectionsFriendlyName = this.currentLineFriendlyName

      this.listLineDirections(station.line.id);
    },

    listLineStations(lineId) {
      this.lineStationsShow = true;
      this.lineStationsListShow = false;
      this.lineStationsListLoading = true;

      axios
        .get('/ratp/stations-line/' + lineId)
        .then(response => {
          this.lineStationsList = response.data;
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
      axios
        .get('/ratp/directions/' + lineId)
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
      hasErrors = false
      this.lineIdHasErrors = false;
      this.lineStationIdHasErrors = false;
      this.directionSensHasErrors = false;

      if (this.lineId.length == 0) {
        this.lineIdErrorMessage = "Please enter a line ID";
        this.lineIdHasErrors = true;
        hasErrors = true;
      }
      if (this.lineStationId.length == 0) {
        this.lineStationIdErrorMessage = "Please enter a station ID";
        this.lineStationIdHasErrors = true;
        hasErrors = true;
      }
      if (!['A', 'R'].includes(this.directionSens)) {
        this.directionSensErrorMessage = "Please enter a valid direction (A/R)";
        this.directionSensHasErrors = true;
        hasErrors = true;
      }

      if (hasErrors) {
        notyf.error("Please correct errors");
        return;
      }

      // start board client
      axios
        .post(
          '/ratp/start-client',
          {
            'line_id': this.lineId,
            'line_station_id': this.lineStationId,
            'direction': this.directionSens,
          }
        )
        .then((response) => {
            if (response.data.status == "OK") {
              notyf.success("Showing departures for " + this.lineId + "/" 
                + this.lineStationId + "/" + this.directionSens);
            }
            else if (response.data.status == "error") {
              notyf.error(this.lineStationId + ": " + response.data.message);
            }
          }
        );
    },
  },
}
</script>

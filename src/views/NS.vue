<template>
  <div id="nederlandse-spoorwegen">
    <h1 class="d-lg-none">NS</h1>
    <div class="row mt-lg-3">
      <!-- search panel -->
      <div id="search" class="col-lg-6" style="padding-right:20px; border-right: 1px solid rgba(0, 0, 0, 0.1);">
        <!-- search form -->
        <div class="form-group">
          <label>Search for a station</label>
          <input
            class="form-control"
            v-model="stationQuery"
            placeholder="Search query"
            @input="callDebounceSearch"
          >
        </div>

        <!-- results -->
        <div v-if="resultsShow" id="results">
          <p><strong>Select a station</strong></p>
          <ul class="list-group list-group-flush">
            <li
                class="list-group-item"
                v-for="(station, code) in results"
                :key="code"
                @click="setStation(code)"
            >
              {{ station.name_long }}
              <mark>{{code}}</mark>
            </li>
          </ul>
        </div>

        <hr class="d-lg-none"/>

      </div>

      <!-- departures panel -->
      <div id="departures" class="col-lg-6">
        <div class="form-group">
          <label>Station code</label>
          <input
            class="form-control"
            v-model="stationCode"
            placeholder="e.g. GVC"
            @input="stationCodeHasErrors = false"
            @keyup.enter="startBoardClient"
            :class="{ 'is-invalid': stationCodeHasErrors }"
          >
          <div class="invalid-feedback">
            {{ stationCodeErrorMessage }}
          </div>
        </div>

        <div class="form-group">
          <button
            @click="startBoardClient"
            type="button"
            class="btn btn-primary form-control"
            ref="start"
            :disabled="!stationCode"
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
  name: 'NationalRail',

  inject: ['notyf'],

  data() {
    return {
      stationQuery: '',
      results: [],
      resultsShow: false,
      stationCode: '',
      stationCodeHasErrors: false,
      stationCodeErrorMessage: ''
    }
  },

  methods: {
    // from https://codepen.io/rabelais88/pen/yqQpMy
    callDebounceSearch: debounce(function(){
      this.search();
    }, 500), // wait for Xms after user has finished typing before searching

    search() {
      this.resultsShow = false;

      // ignore and hide search results if fewer than 3 characters
      if (this.stationQuery.length < 3) {
        return;
      }

      // perform search
      this.axios
        .get('/ns/search/' + this.stationQuery)
        .then(response => (this.results = response.data));
      this.resultsShow = true;
    },

    setStation(code) {
      this.stationCode = code;
      this.startBoardClient();
    },

    startBoardClient() {
      var hasErrors = false;

      // station code must be exactly 3 characters long
      if (this.stationCode.length < 2 || this.stationCode.length > 4) {
        this.stationCodeErrorMessage = "Please enter a 2- to 4-letter station code";
        this.stationCodeHasErrors = true;
        hasErrors = true;
      }

      if (hasErrors) {
        this.notyf.error("Please correct errors");
        return;
      }

      // start board client
      this.axios
        .post(
          '/ns/start-client',
          { 'code': this.stationCode }
        )
        .then((response) => {
            if (response.data.status == "OK") {
              this.notyf.success("Showing departures for " + this.stationCode);
            }
            else if (response.data.status == "error") {
              this.notyf.error(this.stationCode + ": " + response.data.message);
            }
          }
        );
    },
  },
}
</script>

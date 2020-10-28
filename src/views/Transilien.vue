<template>
  <div id="transilien">
    <h1 class="d-lg-none">Transilien</h1>
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
                v-for="result in sortedResults"
                :key="result[0]"
                @click="setStation(result[0])"
            >
              {{ result[1].nom }}
              <mark>{{ result[0] }}</mark>
            </li>
          </ul>
        </div>

        <hr class="d-lg-none"/>

      </div>

      <!-- departures panel -->
      <div id="departures" class="col-lg-6">
        <div class="form-group">
          <label>Station id</label>
          <input
            class="form-control"
            v-model="stationId"
            placeholder="e.g. 87384008"
            @input="stationIdHasErrors = false"
            @keyup.enter="startBoardClient"
            :class="{ 'is-invalid': stationIdHasErrors }"
          >
          <div class="invalid-feedback">
            {{ stationIdErrorMessage }}
          </div>
        </div>

        <div class="form-group">
          <button
            @click="startBoardClient"
            type="button"
            class="btn btn-primary form-control"
            ref="start"
            :disabled="!stationId"
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
  name: 'transilien',

  data() {
    return {
      stationQuery: '',
      results: [],
      resultsShow: false,
      stationId: '',
      stationIdHasErrors: false,
      stationIdErrorMessage: ''
    }
  },

  computed: {
    sortedResults() {
      // sort this.results, e.g.  { "87686006": { "nom": "Paris Gare de Lyon" }, ... },
      // *.nom -- https://stackoverflow.com/a/37607084/2654646
      return Object.entries(this.results).sort((a, b) => a[1].nom.localeCompare(b[1].nom));
    }
  },

  methods: {
    // from https://stationIdpen.io/rabelais88/pen/yqQpMy
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
        .get('/transilien/search/' + this.stationQuery)
        .then(response => (this.results = response.data));
      this.resultsShow = true;
    },

    setStation(stationId) {
      this.stationId = stationId;
      this.startBoardClient();
    },

    startBoardClient() {
      var hasErrors = false;

      // station stationId must be exactly 8 characters long
      if (this.stationId.length != 8) {
        this.stationIdErrorMessage = "Please enter an 8-figure station id";
        this.stationIdHasErrors = true;
        hasErrors = true;
      }

      if (hasErrors) {
        this.notyf.error("Please correct errors");
        return;
      }

      // start board client
      this.axios
        .post(
          '/transilien/start-client',
          { 'station_id': this.stationId }
        )
        .then((response) => {
            if (response.data.status == "OK") {
              this.notyf.success("Showing departures for " + this.stationId);
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

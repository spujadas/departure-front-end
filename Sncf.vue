<template>
  <div id="sncf">
    <h1 class="d-lg-none">SNCF</h1>
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
          <label>Stop area id</label>
          <input
            class="form-control"
            v-model="stopAreaId"
            placeholder="e.g. 87393702"
            @input="stopAreaIdHasErrors = false"
            @keyup.enter="startBoardClient"
            :class="{ 'is-invalid': stopAreaIdHasErrors }"
          >
          <div class="invalid-feedback">
            {{ stopAreaIdErrorMessage }}
          </div>
        </div>

        <div class="form-group">
          <button
            @click="startBoardClient"
            type="button"
            class="btn btn-primary form-control"
            ref="start"
            :disabled="!stopAreaId"
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
  name: 'Sncf',

  data() {
    return {
      stationQuery: '',
      results: [],
      resultsShow: false,
      stopAreaId: '',
      stopAreaIdHasErrors: false,
      stopAreaIdErrorMessage: ''
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
    // from https://stopAreaIdpen.io/rabelais88/pen/yqQpMy
    callDebounceSearch: _.debounce(function(){
      this.search();
    }, 500), // wait for Xms after user has finished typing before searching

    search() {
      this.resultsShow = false;

      // ignore and hide search results if fewer than 3 characters
      if (this.stationQuery.length < 3) {
        return;
      }

      // perform search
      axios
        .get('/sncf/search/' + this.stationQuery)
        .then(response => (this.results = response.data));
      this.resultsShow = true;
    },

    setStation(stopAreaId) {
      this.stopAreaId = stopAreaId;
      this.startBoardClient();
    },

    startBoardClient() {
      hasErrors = false;

      // station stopAreaId must be exactly 8 characters long
      if (this.stopAreaId.length != 8) {
        this.stopAreaIdErrorMessage = "Please enter an 8-figure stop area id";
        this.stopAreaIdHasErrors = true;
        hasErrors = true;
      }

      if (hasErrors) {
        notyf.error("Please correct errors");
        return;
      }

      // start board client
      axios
        .post(
          '/sncf/start-client',
          { 'stop_area_id': this.stopAreaId }
        )
        .then((response) => {
            if (response.data.status == "OK") {
              notyf.success("Showing departures for " + this.stopAreaId);
            }
            else if (response.data.status == "error") {
              notyf.error(this.stopAreaId + ": " + response.data.message);
            }
          }
        );
    },
  },
}
</script>

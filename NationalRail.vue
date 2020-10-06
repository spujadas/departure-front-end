<template>
  <div id="national-rail">
    <h1 class="d-lg-none">National Rail</h1>
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
                v-for="(name, code) in results"
                :key="code"
                @click="setStation(code)"
            >
              {{ name }}
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
            placeholder="e.g. VIC"
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
module.exports = {
  name: 'NationalRail',

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
        .get('/national-rail/search/' + this.stationQuery)
        .then(response => (this.results = response.data));
      this.resultsShow = true;
    },

    setStation(code) {
      this.stationCode = code;
      this.startBoardClient();
    },

    startBoardClient() {
      hasErrors = false;

      // station code must be exactly 3 characters long
      if (this.stationCode.length != 3) {
        this.stationCodeErrorMessage = "Please enter a 3-letter station code";
        this.stationCodeHasErrors = true;
        hasErrors = true;
      }

      if (hasErrors) {
        notyf.error("Please correct errors");
        return;
      }

      // start board client
      axios
        .post(
          '/national-rail/start-client',
          { 'code': this.stationCode }
        )
        .then((response) => {
            if (response.data.status == "OK") {
              notyf.success("Showing departures for " + this.stationCode);
            }
            else if (response.data.status == "error") {
              notyf.error(this.stationCode + ": " + response.data.message);
            }
          }
        );
    },
  },
}
</script>

<template>
  <div id="admin">
    <h1 class="d-lg-none">Administration</h1>
    <div class="row mt-lg-3">
      <div class="col-lg-6">
        <button
          type="button"
          class="btn btn-danger btn-block"
          data-toggle="modal"
          data-target="#confirmBoardServerShutdown"
          :disabled="boardServerShutdownButtonDisabled"
        >
          ⚡ Shutdown board server host
        </button>
        <button
          type="button"
          class="btn btn-danger btn-block"
          data-toggle="modal"
          data-target="#confirmWebServerShutdown"
          :disabled="webServerShutdownButtonDisabled"
        >
          ⚡ Shutdown web server host
        </button>
        <button
          type="button"
          class="btn btn-secondary btn-block"
          @click="refreshServerStatus"
        >
          <svg width="1.2em" height="1.2em" viewBox="0 0 16 16" class="bi bi-arrow-clockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
          Refresh server status
          <div
            v-if="refreshing"
            class="spinner-border spinner-border-sm ml-auto"
            role="status"
            aria-hidden="true">
          </div>
        </button>
      </div>
    </div>

    <!-- modal: confirm board server shutdown -->
    <div class="modal" id="confirmBoardServerShutdown" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmBoardServerShutdownLabel">Shutdown board server host</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Do you really want to shut down the board server host?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              data-dismiss="modal"
              @click="shutdownBoardServerHost"
            >
              Shut down
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- modal: confirm web server shutdown -->
    <div class="modal" id="confirmWebServerShutdown" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmWebServerShutdownLabel">Shutdown web server host</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Do you really want to shut down the web server host?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              data-dismiss="modal"
              @click="shutdownWebServerHost"
            >
              Shut down
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
module.exports = {
  name: 'Admin',

  computed: {
    boardServerShutdownButtonDisabled() {
      return this.refreshing || !this.boardServerUp
    },
    webServerShutdownButtonDisabled() {
      return this.refreshing || this.boardServerUp || !this.webServerUp
    },
  },

  data() {
    return {
      boardServerUp: true,
      refreshing: true,
      webServerUp: true,
    }
  },

  created() {
    this.refreshServerStatus();
  },

  methods: {
    shutdownBoardServerHost() {
      axios
        .post('/shutdown-board-server')
        .then((response) => {
          if (response.data.status == "OK") {
            notyf.success("Shutting down board server host");
          }
          else if (response.data.status == "error") {
            notyf.error({
              "message": "Could not shut down board server host: "
                + response.data.message,
              "duration": 4000
            });
          }
        })
        .catch((error) =>
            notyf.error({
              "message": "Could not shut down board server host: " + error,
              "duration": 4000
            })
        );
    },

    shutdownWebServerHost() {
      axios
        .post('/shutdown-web-server')
        .then((response) => {
          if (response.data.status == "OK") {
            notyf.success("Shutting down web server host – bye!");
          }
        })
        .catch((error) =>
            notyf.error({
              "message": "Could not shut down web server host: " + error,
              "duration": 4000
            })
        );
        this.webServerUp = false;  // mark web server down, refresh to reset
    },

    refreshServerStatus() {
      this.refreshing = true;
      this.boardServerUp = false;
      this.webServerUp = false;
      axios
        .get('/board-server-status')
        .then((response) => {
          this.webServerUp = true;  // reset
          if (response.data.status == "OK") {
            this.boardServerUp = response.data.server_up;
          }
          else if (response.data.status == "error") {
            this.boardServerUp = false;
            notyf.error({
              "message": "Could not get board server status: "
                + response.data.message,
              "duration": 4000
            });
          }
          this.refreshing = false;
        })
        .catch((error) => {
          notyf.error({
            "message": "Could not refresh: " + error,
            "duration": 4000
          });
          this.refreshing = false;
        });
    }
  },
}
</script>

<template>
  <div id="app" class="container-fluid">
    <div class="row">
      <button id="nav-toggler" class="nav-toggler position-fixed d-lg-none" data-toggle="collapse" data-target="#sidebarMenu">
        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-list align-middle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M2.5 11.5A.5.5 0 0 1 3 11h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 3 3h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </button>
      <nav id="sidebarMenu" class="col-lg-3 bg-light pt-3 sidebar d-lg-block collapse show">
        <img src="./assets/departure.png" alt="Departure" class="img-fluid mx-auto d-block" />
        <hr/>

        <!-- providers -->
        <ul class="nav nav-pills flex-column">
          <li
            v-for="(providerData, providerId) in providers"
            :key="providerId"
            class="nav-item"
            @click="hideSidebarIfCollapsible"
          >
            <router-link
              :to="providerData.to"
              class="nav-link flex-fill text-center"
              active-class="active"
            >
              <img :src="providerData.logoSrc" :alt="providerData.logoAlt" style="height: 1.5em; width: auto;"/>
              {{providerData.name}}
            </router-link>
          </li>
        </ul>
        <hr/>

        <!-- stop -->
        <button
          type="button"
          class="btn btn-secondary form-control"
          @click="stopBoardClient"
        >
          ■ Stop board client
        </button>
        <hr/>

        <!-- administration -->
        <ul class="nav nav-pills flex-column">
          <li class="nav-item" @click="hideSidebarIfCollapsible">
            <router-link
              to="/admin"
              class="nav-link flex-fill text-center"
              active-class="active"
            >
              Administration
            </router-link>
          </li>
        </ul>

      </nav>
      <main role="main" class="col-lg-9 ml-lg-auto">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  inject: ['notyf'],

  created() {
    this.providers = {
      'tfl-tube': {
        'to': '/tfl-tube',
        'logoSrc': require('./assets/tfl-tube.png'),
        'logoAlt': '[Tube (TfL)]',
        'name': 'London Underground 🇬🇧'
      },
      'national-rail': {
        'to': '/national-rail',
        'logoSrc': require('./assets/national-rail.png'),
        'logoAlt': '[NR]',
        'name': 'National Rail 🇬🇧'
      },
      'ns': {
        'to': '/ns',
        'logoSrc': require('./assets/ns.png'),
        'logoAlt': '[NS]',
        'name': 'Nederlandse Spoorwegen 🇳🇱'
      },
      'ratp': {
        'to': '/ratp',
        'logoSrc': require('./assets/ratp.png'),
        'logoAlt': '[RATP]',
        'name': 'RATP 🇫🇷'
      },
      'sncf': {
        'to': '/sncf',
        'logoSrc': require('./assets/sncf.png'),
        'logoAlt': '[SNCF]',
        'name': 'SNCF 🇫🇷'
      },
      'transilien': {
        'to': '/transilien',
        'logoSrc': require('./assets/transilien.png'),
        'logoAlt': '[Tube (TfL)]',
        'name': 'Transilien 🇫🇷'
      }
    };
  },

  methods: {
    hideSidebarIfCollapsible() {
      /* hides sidebar after clicking on link if the sidebar is full screen: hackish
      implementation but avoids overloading the app with full BootstrapVue framework */
      if (getComputedStyle(document.getElementById('nav-toggler')).display == 'block') {
        document.getElementById('sidebarMenu').classList.remove('show');
        document.getElementById('nav-toggler').classList.add('collapsed');
      }
    },

    stopBoardClient() {
      axios
        .post('/stop-client')
        .then(() => (this.notyf.success("Stopped departure board")));
    }
  },
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
}

.nav-toggler {
  top: .25rem;
  right: 1rem;
  z-index: 200;
}
</style>
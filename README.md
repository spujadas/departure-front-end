# Departure web front end

This repository contains a web front end for the [Departure web API server](https://github.com/spujadas/departure-python).

![Departure web front end - SNCF Montparnasse](https://user-images.githubusercontent.com/930566/95666197-a39d7e00-0b57-11eb-9856-89579708c146.gif)

This front end Departure supports the following operators:

- [London Underground](https://tfl.gov.uk/modes/tube/) (UK),
- [National Rail](https://www.nationalrail.co.uk/) (UK),
- [Nederlandse Spoorwegen](https://www.ns.nl/) (Netherlands)
- [RATP](https://www.ratp.fr/) (France),
- [SNCF](https://www.sncf.com/) (France),
- [Transilien](https://www.transilien.com/) (France).



See the [Departure-Python documentation page](https://departure-python.readthedocs.io/) for instructions on how to install the front end for use with the Departure web API server (`departure-web`).



### Releases

Pre-built releases of the static files (HTML, JavaScript, assets) of the front end can be found in the repository's [Releases](https://github.com/spujadas/departure-front-end/releases).



### Build

To build the static files yourself, for instance if you want to contribute to the project, first install [Node.js](https://nodejs.org/) and [yarn](https://yarnpkg.com/).

Next, install the project's prerequisites:

```
yarn install
```

To compile and minify the app for production, run the following command:

```
yarn build
```

The bundled app will be located in the `dist` subdirectory, which you can then expose to the Departure web API server (`departure-web`).

To automatically rebuild the app when you make a change to the source, you can run: 

```
yarn build --watch
```



### About

Written by [Sébastien Pujadas](https://pujadas.net/), released under the [MIT license](https://github.com/spujadas/departure-python/blob/master/LICENSE).

All product names, logos, and brands are property of their respective owners. All company, product and service names used in this project are for identification purposes only. Use of these names, logos, and brands does not imply endorsement.


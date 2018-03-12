In order to successfully compile this project, you will need the following pre-requisites:

* `node` and `npm`, check this [Getting started guide](https://docs.npmjs.com/getting-started/installing-node);
* `grunt`, check [Installing Grunt](https://gruntjs.com/installing-grunt);
* `sass` preprocessor, check [Installing SASS](http://sass-lang.com/install).
* `docker` check [Install Docker](https://docs.docker.com/install/).
* `docker-compose` check [Install Docker Compose](https://docs.docker.com/compose/install/)

After that, you can simply:

```
$> npm install
$> grunt
$> tsc
$> docker-compose up
$> npm start
```

Which will:
1. Install all required libraries;
2. Run the default grunt tasks;
3. Run the default backend, and;
4. Automatically open your browser at `public/main.html` for the client-side application.

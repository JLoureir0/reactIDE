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
$> docker-compose up
$> npm start
```

Which will:
1. Install all required libraries;
2. Run the default grunt tasks;
3. Run the default backend, and;
4. Automatically open your browser at `public/main.html` for the client-side application.

Tipos de eventos possíveis:

{ event: 'CREATE_TYPE', data: { id: "input", icon: "fa fa-code" } }
{ event: 'CREATE_TYPE', data: { id: "console", icon: "fa-terminal", style: "red-block console-block" } }
{ event: 'CREATE_TYPE', data: { id: "function", icon: "fa fa-code", style: "gray-block" } }
{ event: 'CREATE_TYPE', data: { id: "if", icon: "fa fa-code", style: "gray-block" } }
{ event: 'CREATE_TYPE', data: { id: "comment", style: "green-block" } }
{ event: 'CREATE_TYPE', data: { id: "trigger", icon: "fa fa-caret-square-o-right", style: "blue-block" } }
{ event: 'CREATE_BLOCK', data: { id: 1, type: "input", properties: { name: "2" } } }
{ event: 'CHANGE_BLOCK_GEOMETRY', data: { id: 1, geom: { x: 100, y: 100 } } }
{ event: 'CHANGE_BLOCK_OUTPUTS', data: { id: 1, outputs: [{ id: "node_1" }] } }
{ event: 'CHANGE_BLOCK_INPUTS', data: { id: 5, inputs: [{ id: "node_4" }, { id: "node_5" }, { id: "node_6" }] } }
{ event: 'CREATE_LINK', data: { id: 1, from: { node: "node_1" }, to: { node: "node_4" } } }
{ event: 'COMMIT', data: {} }
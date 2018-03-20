const backend = new WSBackEnd(config.backendUrl);
const modelview = new ModelView(backend);

function createBlock(type, name) {
    console.log("entrei aqui");
    const block = { event: 'CREATE_BLOCK', data: { id: "0", type: type, properties: { name: name } } };

    backend.send(block.event, block.data);
    backend.on('DOMAIN_EVENT', (topic, msg) => {
        if (msg.event === 'CREATED_ID') {
            console.log("Block created with ID: "+ msg.id + ".");
        } 
      });
}

function createBlock(type, name, x, y) {
    const block = { event: 'CREATE_BLOCK', data: { id: "0", type: type, properties: { name: name } } };

    backend.send(block.event, block.data);
    backend.on('DOMAIN_EVENT', (topic, msg) => {
        if (msg.event === 'CREATED_ID') {
            const geo = { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: msg.id, geom: { x: x, y: y } } };
            backend.send(geo.event, geo.data);
            console.log("Block created with ID: "+ msg.id + ".");
        } 
      });
}

function help() {
    console.log("List of functions to add features to the program:");
    console.log("function_name: 'createBlock'; arguments: 'type ('input'; 'output'; 'console'; 'trigger'), name, coordinateX, coordinateY';\nExample: createBlock('input', '2'); createBlock('input', '2', '100', '100');");
}

/*
 $("#newSink").click(() => {
 const block = { id: newGuid(), name: "New Block", style: "red-block", geom: {x: 30, y: 30}, inputs: [ { id: newGuid() }]};
 model.blocks.push(block);
 drawBlock(block);
 });

 $("#newFunction").click(() => {
 const block = { id: newGuid(), name: "New Block", geom: {x: 30, y: 30}, inputs: [ { id: newGuid() }], outputs: [ { id: newGuid() }]};
 model.blocks.push(block);
 drawBlock(block);
 });

 $("#newSource").click(() => {
 const block = { id: newGuid(), name: "New Block", style: "green-block", geom: {x: 30, y: 30}, outputs: [ { id: newGuid() }]};
 model.blocks.push(block);
 drawBlock(block);
 });
 */

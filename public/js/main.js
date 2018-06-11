const backend = new WSBackEnd(config.backendUrl);
const modelview = new ModelView(backend);
const toolbox = new Toolbox();

function createBlock(type, name) {
    if (typeof type == undefined || typeof name == undefined || arguments.length != 2)
        return console.log("Error: Wrong inputs.");

    const block = { event: 'CREATE_BLOCK', data: { id: 0, type: type, properties: { name: name } } };

    backend.send(block.event, block.data);
    backend.on('DOMAIN_EVENT', (topic, msg) => {
        if (msg.event === 'CREATED_ID') {
            console.log("Block created with ID: " + msg.id + ".");
        }
    });
}

function createBlock(type, name, x, y) {
    if (typeof type == undefined || typeof name == undefined || typeof x == undefined || typeof y == undefined || arguments.length != 4)
        return console.log("Error: Wrong inputs.");

    const block = { event: 'CREATE_BLOCK', data: { id: 0, type: type, properties: { name: name } } };

    backend.send(block.event, block.data);
    backend.on('DOMAIN_EVENT', (topic, msg) => {
        if (msg.event === 'CREATED_ID') {
            const geo = { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: msg.id, geom: { x: x, y: y } } };
            backend.send(geo.event, geo.data);
            console.log("Block created with ID: " + msg.id + ".");
        }
    });
}

function changeInputs(blockID, inputs) {
    if (!Number.isInteger(blockID) || typeof blockID == undefined || typeof inputs == undefined || arguments.length != 2)
        return console.log("Error: Wrong inputs.");

    var inputsParsed = [];
    for (var i in inputs) {
        inputsParsed.push({
            "id": inputs[i]
        });
    }

    const request = { event: 'CHANGE_BLOCK_INPUTS', data: { id: blockID, inputs: inputsParsed } };
    backend.send(request.event, request.data);
}

function changeOutputs(blockID, outputs) {
    if (!Number.isInteger(blockID) || typeof blockID == undefined || typeof outputs == undefined || arguments.length != 2)
        return console.log("Error: Wrong inputs.");

    var outputsParsed = [];
    for (var i in outputs) {
        outputsParsed.push({
            "id": outputs[i]
        });
    }

    const request = { event: 'CHANGE_BLOCK_OUTPUTS', data: { id: blockID, outputs: outputsParsed } };
    backend.send(request.event, request.data);
}

function changeName(blockID, name) {
    if (!Number.isInteger(blockID) || typeof blockID == undefined || typeof name == undefined || arguments.length != 2)
        return console.log("Error: Wrong inputs.");

    const request = { event: 'CHANGE_BLOCK_PROPERTIES', data: { id: blockID, properties: { name: name } } };
    backend.send(request.event, request.data);
}

function createLink(nodeA, nodeB) {
    if (typeof nodeA == undefined || typeof nodeB == undefined || arguments.length != 2)
        return console.log("Error: Wrong inputs.");

    const request = { event: 'CREATE_LINK', data: { id: 0, from: { node: nodeA }, to: { node: nodeB } } };
    backend.send(request.event, request.data);
}

function changeBlockLocation(blockID, x, y) {
    //TODO: OFFSET of 200(toolbox space) should not be hard coded
    if (!Number.isInteger(blockID) || typeof blockID == undefined || typeof x == undefined || typeof y == undefined || arguments.length != 3 || x < 200)
        return console.log("Error: Wrong inputs.");

    const request = { event: 'CHANGE_BLOCK_GEOMETRY', data: { id: blockID, geom: { x: x, y: y } } };
    backend.send(request.event, request.data);
}

function help() {
    console.log("List of functions to add features to the program:");
    console.log("function_name: 'createBlock'; arguments: 'type ('input'; 'output'; 'console'; 'trigger'), name, coordinateX, coordinateY';\nExample: createBlock('input', '2'); createBlock('input', '2', '100', '100');");
    console.log("function_name: 'changeInputs'; arguments: 'blockID, array of nodes';\nExample: changeInputs(1, ['A', 'B']);");
    console.log("function_name: 'changeOutputs'; arguments: 'blockID, array of nodes';\nExample: changeOutputs(1, ['A', 'B']);");
    console.log("function_name: 'changeName'; arguments: 'blockID, name';\nExample: changeName(1, '100');");
    console.log("function_name: 'createLink'; arguments: 'node1, node2';\nExample: createLink('A', 'B');");
    console.log("function_name: 'changeBlockLocation'; arguments: 'blockID, coordinateX, coordinateY';\nExample: changeBlockLocation(1, 100, 200);");
}


$("#diagram").droppable({
    drop: function (event, ui) {
        if (/^palette-test-.*/.test(ui.draggable[0].id)) {
            createBlock(ui.draggable[0].id.substring(13), ui.draggable[0].innerText, ui.offset.left, ui.offset.top);
        }
        else {
            modelview.model.blocks.forEach(block => {
                //checks if block exists, if so, only position changed
                if (block.id == ui.draggable[0]['id']) {
                    changeBlockLocation(parseInt(ui.draggable[0]['id']), block.geom.x, block.geom.y)
                }
            });

        }
    }
});

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

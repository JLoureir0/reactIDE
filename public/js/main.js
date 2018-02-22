const backend = new WSBackEnd(config.backendUrl);
const modelview = new ModelView(backend);

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

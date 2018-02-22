const config = {
    grid: [10, 10],
    pathColor: `#777`,
    pathStroke: 2,
    pathSelectedColor: `#ff7b19`,
    pathHighlightColor: `red`,
    backendUrl: `ws://localhost:8081`
};

function newGuid() { return URL.createObjectURL(new Blob([])).slice(-12); }

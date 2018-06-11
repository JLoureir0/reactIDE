class ModelView {
    constructor(backend) {
        this.model = {};

        paper.setup("myCanvas");
        paper.view.autoUpdate = true;

        backend.on('DOMAIN_EVENT', (topic, msg) => {
            if (msg.event === 'SNAPSHOT') {
                this.model = msg.data;
                this.loadModel();
            } if (msg.event === 'select-block') {
                $(`#${msg.id}`).addClass("block-selected");
            } else if (msg.event === 'unselect-block') {
                $(`#${msg.id}`).removeClass("block-selected");
            }
        });
    }

    triggerPositionChanged(block) {
        (block.outputs || []).concat(block.inputs || []).forEach(node => $(`#${node.id}`).trigger(`positionChanged`));
    }

    drawBlock(block) {
        // Make sure some sensible defaults exist
        if (!block.geom) block.geom = {};

        // Extract useful stuff about the block
        let temp_type = {}
        this.model.types.forEach((elem) => {
            if (elem.id === block.type) temp_type = elem;
        });
        const type = temp_type || {};

        const geometry = block.geom;
        const properties = block.properties || {};

        // Render
        const inputs = (block.inputs || []).map(node => `<li id="${node.id}" class='left-node'></li>`).join(`\n`);
        const outputs = (block.outputs || []).map(node => `<li id="${node.id}" class="right-node"></li>`).join(`\n`);

        $("#diagram").append(`
      <span id="${block.id}" class="block ${geometry.expanded ? "block-expanded" : ""}">
        <ul class="block-left-connectors">${inputs}</ul>
        <div class="block-content ${type.style}">
          <div class="block-header">
            <div class="block-header-icon"><i class="fa ${type.icon}"></i></div>
            <div class="block-header-title blockName" contentEditable="false">${properties.name || ""}</div>
            <div class="block-header-toggle">
              <a id="${block.id}-toggle" class="fa ${geometry.expanded ? "fa-caret-down" : "fa-caret-right"}"></a>
            </div>
          </div>
          <div class="block-body"></div>
        </div>
        <ul class="block-right-connectors">${outputs}</ul>
      </span>`);

        const blockDiv = $(`#${block.id}`);
        const toggleDiv = $(`#${block.id}-toggle`);
        const bodyDiv = blockDiv.find(`.block-body`);

        blockDiv.css({ top: geometry.y, left: geometry.x });

        if (geometry.width) bodyDiv.css({ width: geometry.width });
        if (geometry.height) bodyDiv.css({ height: geometry.height });
        if (properties.text) bodyDiv.append(`<p>${properties.text}</p>`);

        blockDiv.draggable({
            grid: config.grid,
            containment: "parent",
            drag: (event, ui) => {
                block.geom.y = ui.position.top;
                block.geom.x = ui.position.left;
                this.triggerPositionChanged(block);
                event.stopPropagation();
            }
        });

        blockDiv.click(() => blockDiv.toggleClass("block-selected"));

        blockDiv.dblclick(() => {
            blockDiv[0].getElementsByClassName('blockName')[0].contentEditable = "True"
            blockDiv[0].getElementsByClassName('blockName')[0].focus()
        });

        blockDiv[0].getElementsByClassName('blockName')[0].addEventListener("focusout", function () {
            changeName(block.id, this.innerText)
        });

        toggleDiv.click((event) => {
            toggleDiv.toggleClass("fa-caret-right").toggleClass("fa-caret-down");
            blockDiv.toggleClass("block-expanded");

            block.geom.expanded = !block.geom.expanded;

            this.triggerPositionChanged(block);

            event.stopPropagation();
        });
    }

    updatePath(path, elementA, elementB) {
        //TODO: OFFSET of 200(toolbox space) should not be hard coded
        const p1 = { top: elementA.offset().top + elementA.height() / 2, left: elementA.offset().left - 200 + elementA.width() / 2 };
        const p2 = { top: elementB.offset().top + elementB.height() / 2, left: elementB.offset().left - 200 + elementB.width() / 2 };

        path.removeSegments();
        path.add(new paper.Point(p1.left, p1.top));
        path.cubicCurveTo(
            new paper.Point(p1.left + 70, p1.top),
            new paper.Point(p2.left - 70, p2.top),
            new paper.Point(p2.left, p2.top));
    }

    drawConnection(conn) {
        const path = new paper.Path({
            strokeColor: config.pathColor,
            strokeWidth: config.pathStroke
        });

        const elementA = $("#" + conn.from.node);
        const elementB = $("#" + conn.to.node);

        elementA.on('positionChanged', () => this.updatePath(path, elementA, elementB));
        elementB.on('positionChanged', () => this.updatePath(path, elementA, elementB));
        this.updatePath(path, elementA, elementB);

        let updatePathColor = () => path.strokeColor = (conn.selected ? config.pathSelectedColor : config.pathColor);

        path.on({
            click: () => { conn.selected = !conn.selected; updatePathColor() },
            mouseenter: () => path.strokeColor = config.pathHighlightColor,
            mouseleave: () => updatePathColor()
        });
    }

    loadModel() {

        //remove paper children
        paper.project.activeLayer.removeChildren();

        //remove blocks (+ setup canvas again)
        let elem = $("#myCanvas").empty();
        $("#diagram").empty();
        $("#diagram").append(elem);

        for (const block of Object.values(this.model.blocks)) this.drawBlock(block);
        for (const conn of Object.values(this.model.connections)) this.drawConnection(conn);
    }
}

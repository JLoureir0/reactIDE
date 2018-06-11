class Toolbox {
    constructor() {
        $("#palette-header-test").click(() => this.toggle());
        $("#search-input").on('input', () => this.search());
        $(".draggable").draggable({
            cursor: "crosshair",
            revert: true,
            revertDuration: 0
        });
    }

    toggle() {
        if ($("#palette-container-test").hasClass('palette-open')) {
            this.close();
        }
        else {
            this.open();
        }
    }

    open() {
        $("#palette-container-test").addClass("palette-open");
        $("#palette-container-test").removeClass("palette-closed");
        $("#palette-base-category-test").slideDown();
        $("#palette-header-test i").addClass("expanded");
    }

    close() {
        $("#palette-container-test").removeClass("palette-open");
        $("#palette-container-test").addClass("palette-closed");
        $("#palette-base-category-test").slideUp();
        $("#palette-header-test i").removeClass("expanded");
    }

    search() {
        const nodes = ["Input", "Output", "Function"];

        if ($("#search-input").val() === "") {
            $("#palette-container-test").removeClass("hide");
            $("#search-results").empty();
        }
        else {
            var options = {
                shouldSort: true,
                threshold: 0.6,
                location: 0,
                distance: 100,
                maxPatternLength: 32,
                minMatchCharLength: 1,
            };
            $("#palette-container-test").addClass("hide");

            var fuse = new Fuse(nodes, options);
            var results = fuse.search($("#search-input").val());
            $("#search-results").empty();
            results.forEach((result) => $("#search-results").append(`<span>${nodes[result]}</span><br>`));
        }
    }
}
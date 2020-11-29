/*globals define, WebGMEGlobal*/

/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Sat Nov 28 2020 18:49:42 GMT-0500 (Eastern Standard Time).
 */

define([
  "jointjs",
  "css!jointjscss",
  "css!./styles/PetrinetVisualizationWidget.css",
], function (jointjs) {
  "use strict";

  var WIDGET_CLASS = "petrinet-visualization";

  function PetrinetVisualizationWidget(logger, container) {
    this._logger = logger.fork("Widget");

    this._el = container;

    this.nodes = {};
    this._initialize();

    this._logger.debug("ctor finished");
  }

  PetrinetVisualizationWidget.prototype._initialize = function () {
    const width = this._el.width();
    const height = this._el.height();

    // set widget class
    this._el.addClass(WIDGET_CLASS);

    this._graph = new jointjs.dia.Graph();
    this._paper = new jointjs.dia.Paper({
      el: $(this._el),
      width: width,
      height: height,
      gridSize: 1,
      defaultAnchor: { name: "perpendicular" },
      defaultConnectionPoint: { name: "boundary" },
      model: this._graph,
    });

    this._paper.setInteractivity(false);
    this._paper.removeTools();

    // const pn = jointjs.shapes.pn;

    // const pReady = new pn.Place({
    //   position: { x: 140, y: 50 },
    //   attrs: {
    //     ".label": {
    //       text: "ready",
    //       fill: "#7c68fc",
    //     },
    //     ".root": {
    //       stroke: "#9586fd",
    //       "stroke-width": 3,
    //     },
    //     ".tokens > circle": {
    //       fill: "#7a7e9b",
    //     },
    //   },
    //   tokens: 1,
    // });
    // // this._graph.addCell([pReady]);

    // Create a dummy header
    this._el.append("<h3>PetrinetVisualization Events:</h3>");

    // Registering to events can be done with jQuery (as normal)
    this._el.on("dblclick", function (event) {
      event.stopPropagation();
      event.preventDefault();
      this.onBackgroundDblClick();
    });
  };

  PetrinetVisualizationWidget.prototype.onWidgetContainerResize = function (
    width,
    height
  ) {
    this._logger.debug("Widget is resizing...");
    if (this._paper) {
      this._paper.setDimensions(width, height);
      this._paper.scaleContentToFit();
    }
  };

  // Adding/Removing/Updating items
  PetrinetVisualizationWidget.prototype.addNode = function (desc) {
    if (desc) {
      //   Add node to a table of nodes
      var node = document.createElement("div"),
        label = "children";
      if (desc.childrenIds.length === 1) {
        label = "child";
      }
      console.log(desc);
      this.nodes[desc.id] = desc;
      node.innerHTML =
        'Adding node "' +
        desc.name +
        '" (click to view). It has ' +
        desc.childrenIds.length +
        " " +
        label +
        "." +
        desc.id;
      this._el.append(node);
      node.onclick = this.onNodeClick.bind(this, desc.id);
    }
  };

  PetrinetVisualizationWidget.prototype.removeNode = function (gmeId) {
    var desc = this.nodes[gmeId];
    this._el.append('<div>Removing node "' + desc.name + '"</div>');
    delete this.nodes[gmeId];
  };

  PetrinetVisualizationWidget.prototype.updateNode = function (desc) {
    if (desc) {
      this._logger.debug("Updating node:", desc);
      this._el.append('<div>Updating node "' + desc.name + '"</div>');
    }
  };

  /* * * * * * * * Visualizer event handlers * * * * * * * */

  PetrinetVisualizationWidget.prototype.onNodeClick = function (/*id*/) {
    // This currently changes the active node to the given id and
    // this is overridden in the controller.
  };

  PetrinetVisualizationWidget.prototype.onBackgroundDblClick = function () {
    this._el.append("<div>Background was double-clicked!!</div>");
  };

  /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
  PetrinetVisualizationWidget.prototype.destroy = function () {};

  PetrinetVisualizationWidget.prototype.onActivate = function () {
    this._logger.debug("PetrinetVisualizationWidget has been activated");
  };

  PetrinetVisualizationWidget.prototype.onDeactivate = function () {
    this._logger.debug("PetrinetVisualizationWidget has been deactivated");
  };

  return PetrinetVisualizationWidget;
});
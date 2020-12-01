/*globals define, WebGMEGlobal*/

/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Sat Nov 28 2020 18:49:42 GMT-0500 (Eastern Standard Time).
 */
const TRANSITION_TYPE = "Transition";
const PLACES_TYPE = "Place";
const NODE_SOURCE = "src";
const NODE_DST = "dst";
const NUM_POINTS = "numPoints";

define([
  "jointjs",
  "css!jointjscss",
  "css!./styles/PetrinetVisualizationWidget.css",
], function (jointjs) {
  "use strict";

  var WIDGET_CLASS = "petrinet-visualization";

  function PetrinetVisualizationWidget(logger, container, client) {
    this._logger = logger.fork("Widget");

    this._el = container;
    this._client = client;

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

    this._pn = jointjs.shapes.pn;
    this._componentMap = new Map();
    this._unaddedLinks = new Array();
    const proxyUpdate = this.updateTransition;
    this._paper.on("element:pointerdown", (elementView) =>
      this.fireTransition(elementView.model)
    );

    // Create a dummy header
    this._el.append("<h3>PetrinetVisualization Events:</h3>");

    // Registering to events can be done with jQuery (as normal)
    this._el.on("dblclick", function (event) {
      event.stopPropagation();
      event.preventDefault();
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
      var newPnElt;
      //   Add node to a table of nodes
      if (desc.isConnection) {
        const linkNode = this._client.getNode(desc.id);
        const sourceId = linkNode.getOwnPointerId(NODE_SOURCE);
        const dstId = linkNode.getOwnPointerId(NODE_DST);
        if (this._componentMap.has(sourceId) && this._componentMap.has(dstId)) {
          newPnElt = new this._pn.Link({
            source: {
              id: this._componentMap.get(sourceId).id,
              selector: ".root",
            },
            target: {
              id: this._componentMap.get(dstId).id,
              selector: ".root",
            },
            attrs: {
              ".connection": {
                fill: "none",
                "stroke-linejoin": "round",
                "stroke-width": "2",
                stroke: "#4b4a67",
              },
            },
          });
        } else {
          this._unaddedLinks.push(desc);
        }
      } else if (desc.nodeType == TRANSITION_TYPE) {
        newPnElt = new this._pn.Transition({
          position: desc.position,
          attrs: {
            ".label": {
              text: desc.name,
              fill: "#fe854f",
            },
            ".root": {
              fill: "#9586fd",
              stroke: "#9586fd",
            },
          },
        });
      } else if (desc.nodeType == PLACES_TYPE) {
        newPnElt = new this._pn.Place({
          position: desc.position,
          attrs: {
            ".label": {
              text: desc.name,
              fill: "#7c68fc",
            },
            ".root": {
              stroke: "#9586fd",
              "stroke-width": 3,
            },
            ".tokens > circle": {
              fill: "#7a7e9b",
            },
            isFirable: true,
          },
          tokens: this._client.getNode(desc.id).getAttribute(NUM_POINTS),
        });
      }
      if (newPnElt) {
        this._componentMap.set(desc.id, newPnElt);
        this._graph.addCell([newPnElt]);
        for (var i = 0; i < this._unaddedLinks.length; ++i) {
          this.addNode(this._unaddedLinks.shift());
        }
        this._componentMap.forEach((component, _) => {
          if (component instanceof this._pn.Transition) {
            this.updateTransition(component);
          }
        });
      }
    }
  };

  PetrinetVisualizationWidget.prototype.removeNode = function (gmeId) {
    this._el.append('<div>Removing node "' + desc.name + '"</div>');
  };

  PetrinetVisualizationWidget.prototype.updateTransition = function (
    transition
  ) {
    const inbound = this._graph.getConnectedLinks(transition, {
      inbound: true,
    });
    var placesBefore = inbound.map(function (link) {
      return link.getSourceElement();
    });

    var isFirable = true;
    transition.attr(".root/fill", "#9586fd");
    transition.attr("isFirable", true);
    placesBefore.forEach(function (p) {
      if (p.get("tokens") === 0) {
        transition.attr(".root/fill", "#FFFFFF");
        transition.attr("isFirable", false);
        isFirable = false;
      }
    });
    return isFirable;
  };

  PetrinetVisualizationWidget.prototype.updateAllTransitions = function () {
    var noFirableTransitions = true;
    this._componentMap.forEach((component, _) => {
      if (component instanceof this._pn.Transition) {
        if (this.updateTransition(component)) {
          noFirableTransitions = false;
        }
      }
    });
    if (noFirableTransitions) {
      this._client.notifyUser("There are no firable transitions at the moment");
    }
  };

  PetrinetVisualizationWidget.prototype.resetSimulation = function () {
    this._componentMap.forEach((component, componentId) => {
      if (component instanceof this._pn.Place) {
        component.set(
          "tokens",
          this._client.getNode(componentId).getAttribute(NUM_POINTS)
        );
      }
    });
    this.updateAllTransitions();
  };

  PetrinetVisualizationWidget.prototype.fireTransition = function (transition) {
    if (
      transition instanceof this._pn.Transition &&
      transition.attr("isFirable")
    ) {
      const paper = this._paper;
      var inbound = this._graph.getConnectedLinks(transition, {
        inbound: true,
      });
      var outbound = this._graph.getConnectedLinks(transition, {
        outbound: true,
      });

      var placesBefore = inbound.map(function (link) {
        return link.getSourceElement();
      });
      var placesAfter = outbound.map(function (link) {
        return link.getTargetElement();
      });

      placesBefore.forEach(function (p) {
        p.set("tokens", p.get("tokens") - 1);

        var links = inbound.filter(function (l) {
          return l.getSourceElement() === p;
        });

        links.forEach((l) => {
          var token = jointjs.V("circle", { r: 5, fill: "#feb662" });
          l.findView(paper).sendToken(token, 200);
        });
      });

      placesAfter.forEach(function (p) {
        var links = outbound.filter(function (l) {
          return l.getTargetElement() === p;
        });

        links.forEach((link) => {
          var token = jointjs.V("circle", { r: 5, fill: "#feb662" });
          link.findView(paper).sendToken(token, 200);
        });
        p.set("tokens", p.get("tokens") + 1);
      });
      this.updateAllTransitions();
    }
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

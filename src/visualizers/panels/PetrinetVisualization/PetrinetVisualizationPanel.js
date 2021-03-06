/*globals define, _, WebGMEGlobal*/
/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Sat Nov 28 2020 18:49:42 GMT-0500 (Eastern Standard Time).
 */

define([
  "js/PanelBase/PanelBaseWithHeader",
  "js/PanelManager/IActivePanel",
  "widgets/PetrinetVisualization/PetrinetVisualizationWidget",
  "./PetrinetVisualizationControl",
], function (
  PanelBaseWithHeader,
  IActivePanel,
  PetrinetVisualizationWidget,
  PetrinetVisualizationControl
) {
  "use strict";

  function PetrinetVisualizationPanel(layoutManager, params) {
    var options = {};
    //set properties from options
    options[PanelBaseWithHeader.OPTIONS.LOGGER_INSTANCE_NAME] =
      "PetrinetVisualizationPanel";
    options[PanelBaseWithHeader.OPTIONS.FLOATING_TITLE] = true;

    //call parent's constructor
    PanelBaseWithHeader.apply(this, [options, layoutManager]);

    this._client = params.client;

    //initialize UI
    this._initialize();

    this.logger.debug("ctor finished");
  }

  //inherit from PanelBaseWithHeader
  _.extend(PetrinetVisualizationPanel.prototype, PanelBaseWithHeader.prototype);
  _.extend(PetrinetVisualizationPanel.prototype, IActivePanel.prototype);

  PetrinetVisualizationPanel.prototype._initialize = function () {
    var self = this;

    //set Widget title
    this.setTitle("");

    this.widget = new PetrinetVisualizationWidget(
      this.logger,
      this.$el,
      this._client
    );

    this.widget.setTitle = function (title) {
      self.setTitle(title);
    };

    this.control = new PetrinetVisualizationControl({
      logger: this.logger,
      client: this._client,
      widget: this.widget,
    });

    this.onActivate();
  };

  /* OVERRIDE FROM WIDGET-WITH-HEADER */
  /* METHOD CALLED WHEN THE WIDGET'S READ-ONLY PROPERTY CHANGES */
  PetrinetVisualizationPanel.prototype.onReadOnlyChanged = function (
    isReadOnly
  ) {
    //apply parent's onReadOnlyChanged
    PanelBaseWithHeader.prototype.onReadOnlyChanged.call(this, isReadOnly);
  };

  PetrinetVisualizationPanel.prototype.onResize = function (width, height) {
    this.logger.debug("onResize --> width: " + width + ", height: " + height);
    this.widget.onWidgetContainerResize(width, height);
  };

  /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
  PetrinetVisualizationPanel.prototype.destroy = function () {
    this.control.destroy();
    this.widget.destroy();

    PanelBaseWithHeader.prototype.destroy.call(this);
    WebGMEGlobal.KeyboardManager.setListener(undefined);
    WebGMEGlobal.Toolbar.refresh();
  };

  PetrinetVisualizationPanel.prototype.onActivate = function () {
    this.widget.onActivate();
    this.control.onActivate();
    WebGMEGlobal.KeyboardManager.setListener(this.widget);
    WebGMEGlobal.Toolbar.refresh();
  };

  PetrinetVisualizationPanel.prototype.onDeactivate = function () {
    this.widget.onDeactivate();
    this.control.onDeactivate();
    WebGMEGlobal.KeyboardManager.setListener(undefined);
    WebGMEGlobal.Toolbar.refresh();
  };

  return PetrinetVisualizationPanel;
});

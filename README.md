# petrinet
## Installation
First, install the following dependencies of webgme:
- [NodeJS](https://nodejs.org/en/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/)

Second, start mongodb locally by running the `mongod` executable in your mongodb installation (you may need to create a `data` directory or set `--dbpath`).
If your mongodb is on a different port, update this in the `defaultconfig` file. <br>

If you have not already done so, install `webgme-cli` on your computer. <br>
Then, run `webgme start` from the project root to start . Finally, navigate to `http://localhost:8888` to start using petrinet!
=======


## CS 6388 Model Integrated Computing Design Studio Project

This design studio is for building models within the petri net domain. It provides a modeling language for you to build models, and it also provides interpreter/visualizers to help you simulate or run diagnostics on your model.

# Domain
This design studio domain is for modeling petri net models. Petri net models consist of places, transitions, and arcs that map from either places to transitions or transitions to places. We also keep track of the number of "points" that are in each of the places at a given time. When a transition is fired, these points can move from place to place.

This domain can be used to model a number of different problem spaces. It can be used to represent state machine diagrams, or any flow of "items" throughout a system.

# Building Models
You can start building models by creating a new project and using the `Petrinet` seed to start. This will come with the predefined meta-model for the petri net modeling language. You can start building networks by creating an instance of the `Petrinet`. You can rename this network and use a combination of Places, Transitions, and Arcs to build it. You can also specify the number of points that will be present at each place (in the `numPoints` attribute). 

I have added some design with SVGs that will make the composition view more aesthetic and provide more visual information. Points should be visually represented within each Place. The overall network class should also contain information about the number of points that are present at each Place.


# Interpreter
After you have built the model, you can use an interpreter in order to compute properties of your model. The design studio provides a plugin called `PetrinetCodeGenerator` which you can add to the `validPlugins` tab of your network. You can execute this code on the server-side by clicking the arrow on the top-left. This will send a notification if your network falls under any of the following four categories: free-choice petri net, state machine, marked graph, and workflow net. <br>
<br>
The [iCore plugin](https://github.com/webgme/icore) is also provided in this design studio. You can run your own python or Javascript code in the iCore visualizer, and run the code on the server. 

# Visualization
We have built another visualization called the PetrinetVisualization that comes with the design studio. This visualization uses the [jointjs library](https://www.jointjs.com/) to visualize the petri net models. Firable transitions will be colored in, while unfirable transitions will not be. Clicking on the transition triggers an animation and moves points from in-places to out-places. You can use this visualization to conduct simulations on your models.


# Petrinet Modeling Design Studio
## Installation
First, install the following dependencies of webgme:
- [NodeJS](https://nodejs.org/en/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/)

Second, start mongodb locally by running the `mongod` executable in your mongodb installation (you may need to create a `data` directory or set `--dbpath`).
If your mongodb is on a different port, update this in the `defaultconfig` file. <br>

If you have not already done so, install `webgme-cli` on your computer with the command `npm install -g webgme-cli`. <br>
Then, run `webgme start` from the project root to start . Finally, navigate to `http://localhost:8888` to start using petrinet!


# CS 6388 Model Integrated Computing Design Studio Project

This design studio is for building models within the petrinet domain. It provides a modeling language for you to build models, and it also provides interpreters/visualizers to help you simulate or run diagnostics on your model.

## Domain
This design studio domain is for modeling petrinet models. Petrinet models consist of places, transitions, and arcs that map from either places to transitions or transitions to places. We also keep track of the number of "points" that are in each of the places at a given time. When a transition is fired, these points can move from place to place.

This domain can be used to model a number of different problem spaces. It can be used to represent state machine diagrams, or any flow of "items" throughout a system. It will help you keep track of complex systems that need to respond to different kinds of events.

## Building Models
You can start building models by creating a new project and using the `Petrinet` seed to start. This will come with the predefined meta-model for the petrinet modeling language. You can start building networks by creating an instance of the `Petrinet`. You can rename this network and use a combination of places, transitions, and arcs to build it. You can also specify the number of points that will be present at each place (in the `numPoints` attribute). <br>
<br>
I have added some design with SVGs that will make the composition view more aesthetic and provide more visual information. Points should be visually represented within each place. The overall network class should also contain information about the number of points that are present at each place.

## Interpreter
After you have built the model, you can use an interpreter in order to compute properties of your model. The design studio provides a plugin called `PetrinetCodeGenerator` which you can add to the `validPlugins` selection of your network. You can execute this code on the server-side by clicking the arrow on the very left of the toolbar. This will send a notification if your network falls under any of the following four categories: free-choice petrinet, state machine, marked graph, and workflow net. <br>
<br>
The [iCore plugin](https://github.com/webgme/icore) is also provided in this design studio. You can run your own python or Javascript code in the iCore visualizer, and run the code on the server. 

## Visualization
We have built another visualization called the PetrinetVisualization that comes with the design studio. This visualization uses the [jointjs library](https://www.jointjs.com/) to visualize the petrinet models. You can use this visualization to conduct simulations on your model. Firable transitions will be colored in, while unfirable transitions will not be. Clicking on the transition triggers an animation and moves points from in-places to out-places. If at any point there are no more firable transitions, you will be notified by the server. You can also always reset the simulation to its original state by clicking the reset button on the toolbar.


## Example Networks
Along with the modeling language come a couple example networks: 
1. The Retail Order Flow Network
- This network simulates a retail system that takes in client orders and has to ship inventory from its warehouses to fill these orders. This model can be used to simulate the amount of demand that a seller is able to handle, and to help retailers figure out the amount and distribution of inventory that they should be maintaining.
2. The Employee State Machine
- This network models the state of employees within an organization. This could be used to simulate the distribution of employees in a company's workforce as a company goes through its lifecycle of hiring new employees, promoting them, and then losing them. 


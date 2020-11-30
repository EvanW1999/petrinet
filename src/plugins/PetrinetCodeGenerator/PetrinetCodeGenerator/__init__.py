"""
This is where the implementation of the plugin code goes.
The PetrinetCodeGenerator-class is imported from both run_plugin.py and run_debug.py
"""
import sys
import logging
from webgme_bindings import PluginBase

# Setup a logger
logger = logging.getLogger('PetrinetCodeGenerator')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)  # By default it logs to stderr..
handler.setLevel(logging.INFO)
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class PetrinetCodeGenerator(PluginBase):
    def main(self):
        active_node = self.active_node
        core = self.core
        logger = self.logger
        logger.debug('path: {0}'.format(core.get_path(active_node)))
        logger.info('name: {0}'.format(
            core.get_attribute(active_node, 'name')))
        logger.warn('pos : {0}'.format(
            core.get_registry(active_node, 'position')))
        logger.error('guid: {0}'.format(core.get_guid(active_node)))

        children = core.load_children(active_node)
        places, transitions, arcs = self.splitComponents(children)
        self.root_path = core.get_path(active_node)
        self.logger.info(self.root_path)
        self.logger.info(places)

        transInPlaces, transOutPlaces = self.getTransitionPlaces(
            arcs, transitions)
        placeInTrans, placeOutTrans = self.getPlaceTransitions(arcs, places)
        logger.info(transInPlaces)
        logger.info(transOutPlaces)
        logger.info(placeInTrans)
        logger.info(placeOutTrans)
        if self.isFreeChoice(transInPlaces, transitions):
            logger.info("This is a free choice petri net")
        if self.isStateMachine(transInPlaces, transOutPlaces):
            logger.info("This is a state machine")
        if self.isMarkedGraph(placeInTrans, placeOutTrans):
            logger.info("This is a marked graph")
        if self.isWorkflowNet(placeInTrans, placeOutTrans, places):
            logger.info("This is a workflow net")

    def getRelativePath(self, path, root_path):
        return path[path.find(root_path) + len(root_path):]

    def splitComponents(self, children):
        places, transitions, arcs = [], [], []
        for child in children:
            if self.core.is_instance_of(child, self.META["Place"]):
                places.append(child)
            elif self.core.is_instance_of(child, self.META["Transition"]):
                transitions.append(child)
            elif self.core.is_instance_of(child, self.META["Arc"]):
                arcs.append(child)
        return places, transitions, arcs

    def getTransitionPlaces(self, arcs, transitions):
        transInPlaces = {self.core.get_path(
            trans): [] for trans in transitions}
        transOutPlaces = {self.core.get_path(
            trans): [] for trans in transitions}
        for arc in arcs:
            src = self.core.load_pointer(arc, self.SRC_POINTER_NAME)
            dst = self.core.load_pointer(arc, self.DST_POINTER_NAME)
            if self.core.is_instance_of(src, self.META[self.TRANSITION_META_TYPE]):
                transOutPlaces[self.core.get_path(src)].append(
                    self.core.get_path(dst))
            elif self.core.is_instance_of(dst, self.META[self.TRANSITION_META_TYPE]):
                transInPlaces[self.core.get_path(dst)].append(
                    self.core.get_path(src))
        return transInPlaces, transOutPlaces

    def getPlaceTransitions(self, arcs, places):
        placeInTrans = {self.core.get_path(place): [] for place in places}
        placeOutTrans = {self.core.get_path(place): [] for place in places}
        for arc in arcs:
            src = self.core.load_pointer(arc, self.SRC_POINTER_NAME)
            dst = self.core.load_pointer(arc, self.DST_POINTER_NAME)
            if self.core.is_instance_of(src, self.META[self.PLACE_META_TYPE]):
                placeOutTrans[self.core.get_path(src)].append(
                    self.core.get_path(dst))
            elif self.core.is_instance_of(dst, self.META[self.PLACE_META_TYPE]):
                placeInTrans[self.core.get_path(dst)].append(
                    self.core.get_path(src))
        return placeInTrans, placeOutTrans

    def getReachablePlaces(self, place, placeInTrans, placeOutTrans):
        exploredNodes = set([place])
        reachablePlaces = set([place])
        self.logger.info(list(reachablePlaces))
        queue = [place]
        while len(queue) != 0:
            newEltPath = queue.pop(0)
            newElt = self.core.load_by_path(
                self.active_node, self.getRelativePath(newEltPath, self.root_path))
            if self.core.is_instance_of(newElt, self.META[self.PLACE_META_TYPE]):
                outTrans = placeOutTrans[newEltPath]
                for trans in outTrans:
                    if trans not in exploredNodes:
                        exploredNodes.add(trans)
                        queue.append(trans)
            elif self.core.is_instance_of(newElt, self.META[self.TRANSITION_META_TYPE]):
                for curPlace, inTrans in placeInTrans.items():
                    if newEltPath in inTrans and curPlace not in exploredNodes:
                        exploredNodes.add(curPlace)
                        reachablePlaces.add(curPlace)
                        queue.append(curPlace)
        return reachablePlaces

    def isFreeChoice(self, transInPlaces, transitions):
        inPlaces = list(transInPlaces.values())
        return len(inPlaces) == len(set(tuple(inPlaceList) for inPlaceList in inPlaces))

    def isStateMachine(self, transInPlaces, transOutPlaces):
        exactlyOneInPlace = all(
            len(inPlaces) == 1 for inPlaces in transInPlaces.values())
        exactlyOneOutPlace = all(
            len(outPlaces) == 1 for outPlaces in transOutPlaces.values())
        return exactlyOneInPlace and exactlyOneOutPlace

    def isMarkedGraph(self, placeInTrans, placeOutTrans):
        exactlyOneInTrans = all(
            len(inTrans) == 1 for inTrans in placeInTrans.values())
        exactlyOneOutTrans = all(
            len(outTrans) == 1 for outTrans in placeOutTrans.values())
        return exactlyOneInTrans and exactlyOneOutTrans

    def isWorkflowNet(self, placeInTrans, placeOutTrans, places):
        sources = [self.core.get_path(place) for place in places
                   if len(placeInTrans[self.core.get_path(place)]) == 0]
        sinks = [self.core.get_path(place) for place in places
                 if len(placeOutTrans[self.core.get_path(place)]) == 0]
        if len(sources) != 1 or len(sinks) != 1:
            return False
        sourceCanReachAll = len(self.getReachablePlaces(
            sources[0], placeInTrans, placeOutTrans)) == len(places)
        allCanReachSink = all(sinks[0] in self.getReachablePlaces(self.core.get_path(place),
                                                                  placeInTrans, placeOutTrans) for place in places)
        return sourceCanReachAll and allCanReachSink

    TRANSITION_META_TYPE = "Transition"
    PLACE_META_TYPE = "Place"
    ARC_META_TYPE = "Arc"
    SRC_POINTER_NAME = "src"
    DST_POINTER_NAME = "dst"

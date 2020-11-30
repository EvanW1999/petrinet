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

        trans_in_places, trans_out_places = self.getTransitionPlaces(
            arcs, transitions)
        place_in_trans, place_out_trans = self.getPlaceTransitions(
            arcs, places)
        if self.isFreeChoice(trans_in_places):
            self.send_notification('This is a free choice petri net')
        if self.isStateMachine(trans_in_places, trans_out_places):
            self.send_notification("This is a state machine")
        if self.isMarkedGraph(place_in_trans, place_out_trans):
            self.send_notification("This is a marked graph")
        if self.isWorkflowNet(place_in_trans, place_out_trans, places):
            self.send_notification("This is a workflow net")

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
        trans_in_places = {self.core.get_path(
            trans): [] for trans in transitions}
        trans_out_places = {self.core.get_path(
            trans): [] for trans in transitions}
        for arc in arcs:
            src = self.core.load_pointer(arc, self.SRC_POINTER_NAME)
            dst = self.core.load_pointer(arc, self.DST_POINTER_NAME)
            if self.core.is_instance_of(src, self.META[self.TRANSITION_META_TYPE]):
                trans_out_places[self.core.get_path(src)].append(
                    self.core.get_path(dst))
            elif self.core.is_instance_of(dst, self.META[self.TRANSITION_META_TYPE]):
                trans_in_places[self.core.get_path(dst)].append(
                    self.core.get_path(src))
        return trans_in_places, trans_out_places

    def getPlaceTransitions(self, arcs, places):
        place_in_trans = {self.core.get_path(place): [] for place in places}
        place_out_trans = {self.core.get_path(place): [] for place in places}
        for arc in arcs:
            src = self.core.load_pointer(arc, self.SRC_POINTER_NAME)
            dst = self.core.load_pointer(arc, self.DST_POINTER_NAME)
            if self.core.is_instance_of(src, self.META[self.PLACE_META_TYPE]):
                place_out_trans[self.core.get_path(src)].append(
                    self.core.get_path(dst))
            elif self.core.is_instance_of(dst, self.META[self.PLACE_META_TYPE]):
                place_in_trans[self.core.get_path(dst)].append(
                    self.core.get_path(src))
        return place_in_trans, place_out_trans

    def getReachablePlaces(self, place, place_in_trans, place_out_trans):
        explored_nodes = set([place])
        reachable_places = set([place])
        self.logger.info(list(reachable_places))
        queue = [place]
        while len(queue) != 0:
            new_elt_path = queue.pop(0)
            new_elt = self.core.load_by_path(
                self.active_node, self.getRelativePath(new_elt_path, self.root_path))
            if self.core.is_instance_of(new_elt, self.META[self.PLACE_META_TYPE]):
                out_trans = place_out_trans[new_elt_path]
                for trans in out_trans:
                    if trans not in explored_nodes:
                        explored_nodes.add(trans)
                        queue.append(trans)
            elif self.core.is_instance_of(new_elt, self.META[self.TRANSITION_META_TYPE]):
                for cur_place, in_trans in place_in_trans.items():
                    if new_elt_path in in_trans and cur_place not in explored_nodes:
                        explored_nodes.add(cur_place)
                        reachable_places.add(cur_place)
                        queue.append(cur_place)
        return reachable_places

    def isFreeChoice(self, transInPlaces):
        in_places = list(transInPlaces.values())
        return len(in_places) == len(set(tuple(inPlaceList) for inPlaceList in in_places))

    def isStateMachine(self, transInPlaces, transOutPlaces):
        exactly_one_in_place = all(
            len(in_places) == 1 for in_places in transInPlaces.values())
        exactly_one_out_place = all(
            len(out_places) == 1 for out_places in transOutPlaces.values())
        return exactly_one_in_place and exactly_one_out_place

    def isMarkedGraph(self, place_in_trans, place_out_trans):
        exactly_one_in_trans = all(
            len(in_trans) == 1 for in_trans in place_in_trans.values())
        exactly_one_out_trans = all(
            len(out_trans) == 1 for out_trans in place_out_trans.values())
        return exactly_one_in_trans and exactly_one_out_trans

    def isWorkflowNet(self, place_in_trans, place_out_trans, places):
        sources = [self.core.get_path(place) for place in places
                   if len(place_in_trans[self.core.get_path(place)]) == 0]
        sinks = [self.core.get_path(place) for place in places
                 if len(place_out_trans[self.core.get_path(place)]) == 0]
        if len(sources) != 1 or len(sinks) != 1:
            return False
        source_can_reach_all = len(self.getReachablePlaces(
            sources[0], place_in_trans, place_out_trans)) == len(places)
        all_can_reach_sink = all(sinks[0] in self.getReachablePlaces(self.core.get_path(place),
                                                                     place_in_trans, place_out_trans) for place in places)
        return source_can_reach_all and all_can_reach_sink

    TRANSITION_META_TYPE = "Transition"
    PLACE_META_TYPE = "Place"
    ARC_META_TYPE = "Arc"
    SRC_POINTER_NAME = "src"
    DST_POINTER_NAME = "dst"

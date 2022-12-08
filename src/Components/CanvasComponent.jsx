import React, { useState } from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";

export default function CanvasComponent() {
  const [nodeDataArray, setNodeDataArray] = useState([
    { key: 1, text: "Node1", color: "#66ffff", loc: "0 0" },
    { key: 2, text: "Node4", color: "orange", loc: "176 0" },
    { key: 3, text: "Node3", color: "lightgreen", loc: "132 76" },
    { key: 4, text: "Node6", color: "pink", loc: "44 -76" },
    { key: 5, text: "Node5", color: "#d1d1e0", loc: "132 -76" },
    { key: 6, text: "Node2", color: "#cc6699", loc: "44 76" },
  ]);

  const [linkDataArray, setLinkDataArray] = useState([
    { key: -5, from: 4, to: 3 },
  ]);

  const [skipsDiagramUpdate, setSkipsDiagramUpdate] = useState(false);

  const mapNodeKeyIdx = new Map();
  refreshNodeIndex(nodeDataArray);

  function refreshNodeIndex(nodeArr) {
    mapNodeKeyIdx.clear();
    nodeArr.forEach((n, idx) => {
      mapNodeKeyIdx.set(n.key, idx);
    });
  }

  const mapLinkKeyIdx = new Map();
  refreshLinkIndex(linkDataArray);
  function refreshLinkIndex(linkArr) {
    mapLinkKeyIdx.clear();
    linkArr.forEach((l, idx) => {
      mapLinkKeyIdx.set(l.key, idx);
    });
  }

  function handleModelChange(obj) {
    if (obj === null) return;
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;
    const insertedLinkKeys = obj.insertedLinkKeys;
    const modifiedLinkData = obj.modifiedLinkData;
    const removedLinkKeys = obj.removedLinkKeys;

    let nodeArr = nodeDataArray.slice();
    let linkArr = linkDataArray.slice();
    const modifiedNodeMap = new Map();
    const modifiedLinkMap = new Map();
    let arrChanged = false;

    if (modifiedNodeData) {
      modifiedNodeData.forEach((nd) => {
        modifiedNodeMap.set(nd.key, nd);
        const idx = mapNodeKeyIdx.get(nd.key);
        if (idx !== undefined && idx >= 0) {
          nodeArr.splice(idx, 1, nd);
          arrChanged = true;
        }
      });
    }
    if (insertedNodeKeys) {
      insertedNodeKeys.forEach((key) => {
        const nd = modifiedNodeMap.get(key);
        const idx = mapNodeKeyIdx.get(key);
        if (nd && idx === undefined) {
          mapNodeKeyIdx.set(nd.key, nodeArr.length);
          nodeArr.push(nd);
          arrChanged = true;
        }
      });
    }
    if (removedNodeKeys) {
      nodeArr = nodeArr.filter((nd) => {
        if (removedNodeKeys.includes(nd.key)) {
          arrChanged = true;
          return false;
        }
        return true;
      });
      refreshNodeIndex(nodeArr);
    }
    if (modifiedLinkData) {
      modifiedLinkData.forEach((ld) => {
        modifiedLinkMap.set(ld.key, ld);
        const idx = mapLinkKeyIdx.get(ld.key);
        if (idx !== undefined && idx >= 0) {
          linkArr.splice(idx, 1, ld);
          arrChanged = true;
        }
      });
    }
    if (insertedLinkKeys) {
      insertedLinkKeys.forEach((key) => {
        const ld = modifiedLinkMap.get(key);
        const idx = mapLinkKeyIdx.get(key);
        if (ld && idx === undefined) {
          mapLinkKeyIdx.set(ld.key, linkArr.length);
          linkArr.push(ld);
          arrChanged = true;
        }
      });
    }
    if (removedLinkKeys) {
      linkArr = linkArr.filter((ld) => {
        if (removedLinkKeys.includes(ld.key)) {
          arrChanged = true;
          return false;
        }
        return true;
      });
      refreshLinkIndex(linkArr);
    }
    if (arrChanged) {
      setNodeDataArray(nodeArr);
      setLinkDataArray(linkArr);
      setSkipsDiagramUpdate(true);
    }
  }

  function tempArray() {
    var temp = _CachedArrays.pop();
    if (temp === undefined) return [];
    return temp;
  }
  function createPolygon(sides) {
    var points = tempArray();
    var radius = 0.5;
    var center = 0.5;
    var offsetAngle = Math.PI * 1.5;
    var angle = 0;
    for (var i = 0; i < sides; i++) {
      angle = ((2 * Math.PI) / sides) * i + offsetAngle;
      points[i] = new go.Point(
        center + radius * Math.cos(angle),
        center + radius * Math.sin(angle)
      );
    }
    points.push(points[0]);
    return points;
  }
  var _CachedArrays = [];
  function freeArray(a) {
    a.length = 0;
    _CachedArrays.push(a);
  }
  go.Shape.defineFigureGenerator("Hexagon", function (shape, w, h) {
    var points = createPolygon(6);
    var geo = new go.Geometry();
    var fig = new go.PathFigure(points[0].x * w, points[0].y * h, true);
    geo.add(fig);
    for (var i = 1; i < 6; i++) {
      fig.add(
        new go.PathSegment(
          go.PathSegment.Line,
          points[i].x * w,
          points[i].y * h
        )
      );
    }
    fig.add(
      new go.PathSegment(
        go.PathSegment.Line,
        points[0].x * w,
        points[0].y * h
      ).close()
    );
    freeArray(points);
    geo.spot1 = new go.Spot(0.07, 0.25);
    geo.spot2 = new go.Spot(0.93, 0.75);
    return geo;
  });
  function getRandomColor() {
    var colorArray = ["#66ffff", "#66ff99", "#ffff99", "#ff6666"];
    let randomeval = Math.floor(Math.random() * 3);
    return colorArray[randomeval].toString();
  }
  function initDiagram() {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, {
      "undoManager.isEnabled": true,
      "clickCreatingTool.archetypeNodeData": {
        text: "new node",
        color: getRandomColor(),
      },
      model: $(go.GraphLinksModel, { linkKeyProperty: "key" }),
    });
    diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      {
        click: function (e, node) {
          var diag = e.diagram;
          e.handled = true;
          var tool = diag.toolManager.linkingTool;
          tool.startObject = node.findPort("");
          diag.currentTool = tool;
          tool.doActivate();
        },
      },
      $(
        go.Shape,
        {
          figure: "hexagon",
          strokeWidth: 0,
          height: 100,
          width: 100,
          fill: "white",
          portId: "",
          fromLinkable: true,
          fromLinkableDuplicates: false,
          toLinkable: true,
          toLinkableSelfNode: false,
          toLinkableDuplicates: false,
          cursor: "pointer",
        },
        new go.Binding("fill", "color")
      ),

      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
        go.Point.stringify
      ),
      $(
        go.TextBlock,
        { margin: 8, editable: true },
        new go.Binding("text").makeTwoWay()
      )
    );
    diagram.linkTemplate = $(
      go.Link,
      {
        // curve: go.Link.Bezier,
        adjusting: go.Link.Stretch,
        reshapable: true,
        relinkableFrom: true,
        relinkableTo: true,
        toShortLength: 3,
      },
      $(go.Shape, { strokeWidth: 1.5 }),
      $(go.Shape, { toArrow: "standard", stroke: "white" }),
      $(
        go.TextBlock,
        "",
        {
          textAlign: "center",
          font: "9pt helvetica, arial, sans-serif",
          margin: 4,
          editable: true,
        },
        new go.Binding("text").makeTwoWay()
      )
    );
    return diagram;
  }
  return (
    <ReactDiagram
      divClassName="diagram-component"
      initDiagram={initDiagram}
      nodeDataArray={nodeDataArray}
      linkDataArray={linkDataArray}
      skipsDiagramUpdate={skipsDiagramUpdate}
      onModelChange={handleModelChange}
    />
  );
}

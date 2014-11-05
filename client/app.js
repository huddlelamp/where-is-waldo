if (Meteor.isClient) {
    var canvas = HuddleCanvas.create("192.168.96.211", 1948, {
    containerId: "huddle-canvas-container",
    backgroundImage: "/images/where-is-waldo1.jpg",
    panningEnabled: false,
    showDebugBox: false
  });
}


import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
export function babdemo() {
// Get the canvas DOM element
  var canvas = document.createElement('canvas');
// Load the 3D engine
  var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
// CreateScene function that creates and return the scene
  var createScene = function () {
    // Create a basic BJS Scene object

    var scene = new BABYLON.Scene(engine);
    var manager = new GUI.GUI3DManager(scene);
    var anchor = new BABYLON.TransformNode("");
    var panel = new GUI.PlanePanel();
    panel.isVertical = true;

    panel.margin = 0.2;

    manager.addControl(panel);
    panel.linkToTransformNode(anchor);
    panel.position.z = -1.5;
// Let's add some buttons!
    var addButton = function() {
      var button = new GUI.HolographicButton("orientation");
      panel.addControl(button);

      button.text = "Button #" + panel.children.length;
    }

    panel.blockLayout = true;
    for (var index = 0; index < 6000; index++) {
      addButton();
    }
    panel.blockLayout = false;
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -100), scene);
    // Target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    // Attach the camera to the canvas
    camera.attachControl(canvas, false);
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
    // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene, false, BABYLON.Mesh.FRONTSIDE);
    // Move the sphere upward 1/2 of its height
    sphere.position.y = 1;
    // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
    var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene, false);
    // Return the created scene
    return scene;
  }
// call the createScene function
  var scene = createScene();
// run the render loop
  engine.runRenderLoop(function () {
    scene.render();
  });
// the canvas/window resize event handler
  window.addEventListener('resize', function () {
    engine.resize();
  });
  return canvas
}
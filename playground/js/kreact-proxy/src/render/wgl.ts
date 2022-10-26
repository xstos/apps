import * as THREE from 'three'
import {vectxt, vectxttris} from "./vectorizeText"
import {InteractionManager} from "three.interactive"
import {Line2, LineGeometry, LineMaterial} from "three-fatline"
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls"
import {fitCameraToCenteredObject} from "./fitcamera2obj"

export function makeGLRenderer() {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    50000)

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  })
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.prepend(renderer.domElement)

  const interactionManager = new InteractionManager(
    renderer,
    camera,
    renderer.domElement,
    undefined
  );

  const controls = new OrbitControls(camera, renderer.domElement)

  const material = new THREE.LineBasicMaterial({
    color: 0xffffff
  });
  function makeRegularLine() {
    const points = [];
    vectxt("1").map(([x1,y1,x2,y2])=> {
      points.push(new THREE.Vector3( x1, -y1,0 ) )
      points.push(new THREE.Vector3( x2, -y2, 0 ) )
    })

    const geometry = new THREE.BufferGeometry().setFromPoints( points );

    return new THREE.LineSegments( geometry, material );

  }
  function makeTriangleStrip() {
    const o = vectxttris('O')
    const geometry = new THREE.BufferGeometry();
    let vertices = o.map(triplet=>{
      const [[x1,y1],[x2,y2],[x3,y3]]=triplet
      return [x1,y1,0,x2,y2,0,x3,y3,0]
    }).flat()

    vertices = new Float32Array(vertices)
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );


    const mesh = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({
      color: 0xffffff
    }))
    mesh.geometry.computeBoundingBox()

    //const foo = mesh.geometry.boundingBox

    return mesh
  }
  function makeFatLine() {
    const geometry = new LineGeometry();
    geometry.fromLineSegments(makeRegularLine()); // [ x1, y1, z1,  x2, y2, z2, ... ] format

    const material = new LineMaterial({
      color: 'red',
      linewidth: 10, // px
      resolution: new THREE.Vector2(640, 480) // resolution of the viewport
      // dashed, dashScale, dashSize, gapSize
    });

    const myLine = new Line2(geometry, material);

    //myLine.computeLineDistances();
    return myLine
  }
  const line = makeTriangleStrip()

  const box2 = new THREE.Box3().setFromObject(line)
  const sz = new THREE.Vector3()
  box2.getSize(sz)
  line.geometry.translate(-sz.x/2,-sz.y/2,0)
  const box = new THREE.BoxHelper(line, 0xffff00);
  function hookupEvents(line) {
    line.addEventListener('mouseover', (event) => {
      console.log(event);

      event.target.material.color.set(0xff0000);

      document.body.style.cursor = 'pointer';
    });
    line.addEventListener('mouseout', (event) => {
      console.log(event);

      event.target.material.color.set(0xffffff);

      document.body.style.cursor = 'default';
    });
    line.addEventListener('mousedown', (event) => {
      console.log(event);

      event.target.material.color.set(0x0000ff);
    });
    line.addEventListener('mouseup', (event) => {
      console.log(event);

      if (event.intersected) {
        event.target.material.color.set(0xff0000);
      } else {
        event.target.material.color.set(0x000000);
      }
    });
    line.addEventListener('click', (event) => {
      console.log(event);

      // alert('click');
    });
  }



  hookupEvents(line)
  var grid = new THREE.GridHelper(1000, 10);
  grid.geometry.rotateX(Math.PI / 2)
  scene.add( line, box, grid );
  interactionManager.add(line);
  fitCameraToCenteredObject(camera,line,0,controls)
  console.log(camera.position)
  window.addEventListener('resize', onWindowResize, false)
  function onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    render()
  }

  function animate() {
    requestAnimationFrame(animate)
    interactionManager.update();

    //cube.rotation.x += 0.01
    controls.update()
    render()
  }

  function render() {
    /*
    //https://discourse.threejs.org/t/can-i-only-re-render-a-few-object-in-the-scene-and-keep-others-as-they-already-rendered-in-the-previous-step/14517
    renderer.clear();
    renderer.render( scene1, camera );
    renderer.clearDepth(); // optional
    renderer.render( scene.2, camera );
     */
    renderer.render(scene, camera)
  }
  animate()
}

function boundingBox(x,y,z) {

}
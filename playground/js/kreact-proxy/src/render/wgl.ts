import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {vectxt, vectxttris} from "./vectorizeText"
import {InteractionManager} from "three.interactive"
import {Line2, LineGeometry, LineMaterial} from "three-fatline"
export function makeGLRenderer() {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    50000)
  camera.position.z = 500
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

  //const controls = new OrbitControls(camera, renderer.domElement)

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
    const points = []
    const o = vectxttris('O')
  }
  makeTriangleStrip()
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
  const line = makeRegularLine()
  function hookupEvents(line) {
    line.addEventListener('mouseover', (event) => {
      console.log(event);

      event.target.material.color.set(0xff0000);

      document.body.style.cursor = 'pointer';
    });
    line.addEventListener('mouseout', (event) => {
      console.log(event);

      event.target.material.color.set(0x000000);

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
  scene.add( line );
  interactionManager.add(line);
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
    //cube.rotation.y += 0.01

    //controls.update()

    render()
  }

  function render() {
    renderer.render(scene, camera)
  }
  animate()
}


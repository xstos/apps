import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {vectxt} from "./vectorizeText"
export function makeGLRenderer() {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 2
  camera.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI*2)
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.prepend(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)

  const material = new THREE.LineBasicMaterial({
    color: 0xffffff
  });

  const points = [];
  vectxt("HELOOO").map(([x1,y1,x2,y2])=> {
    points.push(new THREE.Vector3( x1, -y1,0 ) )
    points.push(new THREE.Vector3( x2, -y2, 0 ) )
  })
  //points.push( new THREE.Vector3( 0.1, 0.1, 0 ) );
  //points.push( new THREE.Vector3( 0, 0.1, 0 ) );
  //points.push( new THREE.Vector3( 0.1, 0, 0 ) );

  const geometry = new THREE.BufferGeometry().setFromPoints( points );

  const line = new THREE.LineSegments( geometry, material );
  scene.add( line );

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

    //cube.rotation.x += 0.01
    //cube.rotation.y += 0.01

    controls.update()

    render()
  }

  function render() {
    renderer.render(scene, camera)
  }
  animate()
}


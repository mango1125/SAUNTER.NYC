import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadBuildingModel } from '../../scripts/modelLoader.js';
import { loadSkyboxModel, lights, domeObjects } from '../../scripts/domeLoader.js'; 
import { Water } from 'three/addons/objects/Water.js'; 

let renderer, scene, camera, controls;
let water;
let pmremGenerator;
let gui; // Dat.GUI instance


function init() {
    // Getting JSON files
    const modelJsonFiles = document.body.getAttribute('data-model-json-files');
    const domeJsonFiles = document.body.getAttribute('data-dome-json-files');

    if (!modelJsonFiles || !domeJsonFiles) {
        console.error('No JSON files specified in the data attribute');
        return;
    }

    const modelFilesArray = modelJsonFiles.split(',');
    const domeFilesArray = domeJsonFiles.split(',');

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        logarithmicDepthBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Initialize PMREMGenerator
    pmremGenerator = new THREE.PMREMGenerator(renderer);

   
    

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    const near = 4000; // Start fog at 4000 units
    const far = 20000; // End fog at 20000 units
    const fogColor = new THREE.Color(0x87CEEB);


    // Create fog
    scene.fog = new THREE.Fog(fogColor, near, far);

    // Water
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('/models/2024export/scenery/ground/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
        }
    );
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(700, 300, 850);
    camera.rotation.set(-25, 50, 20);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    ambientLight.intensity = 2; 

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    // Load dome models
    loadMultipleJSONFiles(domeFilesArray, scene, loadSkyboxModel)
        .then(() => {
            console.log('All dome models loaded');
            console.log('Dome objects:', domeObjects); // Check domeObjects
        })
        .catch(error => {
            console.error('Error loading dome models:', error);
        });

    // Load building models
    loadMultipleJSONFiles(modelFilesArray, scene, loadBuildingModel)
        .then(() => {
            console.log('All building models loaded');
        })
        .catch(error => {
            console.error('Error loading building models:', error);
        });

    // Setup dat.GUI
    //gui = new dat.GUI();
    //setupGUI(); // Function to set up GUI controls

    // Start rendering loop
    animate();
}

function loadMultipleJSONFiles(filesArray, scene, loaderFunction) {
    return filesArray.reduce((promise, file) => {
        return promise.then(() => {
            return fetch(file.trim())
                .then(response => response.json())
                .then(data => {
                    if (!data || !data.models) {
                        throw new Error(`Invalid JSON format or missing data in file ${file}`);
                    }

                    const models = data.models;

                    // Load all models
                    return Promise.all(models.map(modelInfo => loaderFunction(modelInfo, scene)));
                })
                .then(loadedModels => {
                    console.log(`Loaded ${loadedModels.length} models from ${file}`);
                });
        });
    }, Promise.resolve());
}

function animate() {
    requestAnimationFrame(animate);

    // Update water animation if applicable
    if (water && water.material && water.material.uniforms) {
        water.material.uniforms['time'].value += 1.0 / 60.0;
    }

    // Update controls
    controls.update();

    // Render scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

//function setupGUI() {
  // Create a toggle switch for lights
  //const lightsFolder = gui.addFolder('Lights');
  //lightsFolder.add({ toggleLights: () => toggleLights() }, 'toggleLights').name('Toggle Lights');
//}


function toggleLights() {
  if (lights) {
      lights.visible = !lights.visible; // Toggle visibility of lights
  }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    init();
});

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadBuildingModel } from '../../scripts/modelLoader.js';

let renderer, scene, camera, controls;
let pmremGenerator;

function init() {
    // Getting JSON files
    const modelJsonFiles = document.body.getAttribute('data-model-json-files');

    if (!modelJsonFiles) {
        console.error('No JSON files specified in the data attribute');
        return;
    }

    const modelFilesArray = modelJsonFiles.split(',');

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        antialias: false,
        logarithmicDepthBuffer: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Initialize PMREMGenerator
    pmremGenerator = new THREE.PMREMGenerator(renderer);

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Sky blue background

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(282.84, 282.84, 282.84); // 400 units at 45 degrees from each axis
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the origin

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 1;

    // Disable zoom and pan
    controls.enablePan = false;

    // Limit rotation to horizontal (left/right) and prevent looking underneath
    controls.minPolarAngle = 0; // Allow looking directly upwards
    controls.maxPolarAngle = Math.PI / 2; // Prevent looking underneath

    // Set zoom limits
    controls.minDistance = 100; // Starting position is the furthest out you can zoom
    controls.maxDistance = 1950; // Prevent zooming out further
    controls.enableZoom = true;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    ambientLight.intensity = 3;

    // Load building models
    loadMultipleJSONFiles(modelFilesArray, scene, loadBuildingModel)
        .then(() => {
            console.log('All building models loaded');
        })
        .catch(error => {
            console.error('Error loading building models:', error);
        });

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

    // Render scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    init();
});
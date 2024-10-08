import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadBuildingModel } from '../../scripts/modelLoader.js';

let renderer, scene, camera, controls;
let pmremGenerator;
let pivot;


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

    const near = 200; // Start fog at 4000 units
    const far = 700; // End fog at 20000 units
    const fogColor = new THREE.Color(0xffffff);


    // Create fog
    scene.fog = new THREE.Fog(fogColor, near, far);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(400, 0, 0);
    camera.rotation.set(0, 0, 0);

    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.001;

        // Disable zoom and pan
        controls.enableZoom = false;
        controls.enablePan = false;
    
        // Limit rotation to horizontal (left/right)
        controls.maxPolarAngle = Math.PI / 2; // Prevent looking too far up
        controls.minPolarAngle = Math.PI / 2; // Prevent looking too far down

    // Create a pivot point for the camera to orbit around
    pivot = new THREE.Object3D();
    scene.add(pivot);
    pivot.add(camera);

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

    // Apply a small horizontal rotation to the pivot point
    if (pivot) {
        pivot.rotation.y += 0.001; // Adjust the rotation speed as needed
    }

    // Render scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    init();
});
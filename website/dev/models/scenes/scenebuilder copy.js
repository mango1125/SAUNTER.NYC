import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadBuildingModel } from '/scripts/modelLoader.js';
import { loadSkyboxModel, lights } from '/scripts/domeLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { setupTimeGUI } from '/scripts/timegui.js';
import { lightHandler, setLightsObject } from '/scripts/dynamicsky.js';

let renderer, scene, camera, controls;
let water;
let pmremGenerator;
let time;
let lightUpdater; // Define lightUpdater variable

function init() {
    // getting JSON files
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
    controls.dampingFactor = 1;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);
    ambientLight.intensity = 3.0;

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);
    directionalLight.intensity = 1.0;

    // Load dome models
    loadMultipleJSONFiles(domeFilesArray, scene, loadSkyboxModel)
        .then(() => {
            console.log('All dome models loaded');
            // Set lights object after dome models are loaded
            setLightsObject(lights);
            // Initialize light handler and assign to lightUpdater
            lightUpdater = lightHandler;
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

    // Function to handle time change
    function onTimeChange(time) {
        console.log('Time changed to:', time);
        if (lightUpdater) {
            lightUpdater(time); // Update lights opacity based on time
        } else {
            console.warn('lightUpdater is not yet defined');
        }
    }

    // Set up time GUI
    setupTimeGUI(onTimeChange);

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

    // Ensure controls is initialized and has update method
    if (controls) {
        controls.update(); // Update controls (if enabled)
    }

    renderer.render(scene, camera);
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    init();
});

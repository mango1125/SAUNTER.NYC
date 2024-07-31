import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadBuildingModel } from '../../scripts/modelLoader.js';

export class SceneBuilderBase {
    
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.pmremGenerator = null;
    }

    init(modelHtmlTag='three-model', backgroundColor=0xf7f7f7, damping=true) {
        // Getting JSON files
        const modelHtmlElement = document.getElementById(modelHtmlTag);
        const modelJsonFiles = modelHtmlElement.getAttribute('data-model-json-files');

        if (!modelJsonFiles) {
            console.error('No JSON files specified in the data attribute');
            return;
        }

        const modelFilesArray = modelJsonFiles.split(',');
        const sizeX = modelHtmlElement.getAttribute('data-size-x');
        const sizeY = modelHtmlElement.getAttribute('data-size-y');

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            logarithmicDepthBuffer: false
        });
        this.renderer.setSize(sizeX, sizeY);

        // TODO: CHANGE THIS LINE
        document.body.appendChild(this.renderer.domElement);

        // Initialize PMREMGenerator
        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);

        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(backgroundColor); // Sky blue background

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, sizeX / sizeY, 0.1, 100000);
        this.camera.position.set(282.84, 282.84, 282.84); // 400 units at 45 degrees from each axis
        this.camera.lookAt(new THREE.Vector3(0, 0, 0)); // Look at the origin

        // Controls setup
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = damping;
        this.controls.dampingFactor = 1;

        // Disable zoom and pan
        this.controls.enablePan = false;

        // Limit rotation to horizontal (left/right) and prevent looking underneath
        this.controls.minPolarAngle = 0; // Allow looking directly upwards
        this.controls.maxPolarAngle = Math.PI / 2; // Prevent looking underneath

        // Set zoom limits
        this.controls.minDistance = 100; // Starting position is the furthest out you can zoom
        this.controls.maxDistance = 1000; // Prevent zooming out further
        this.controls.enableZoom = true;

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambientLight);
        ambientLight.intensity = 3;

        // Load building models
        // SceneBuilderBase.loadMultipleJSONFiles(modelFilesArray, self.scene, loadBuildingModel)
        loadMultipleJSONFiles(modelFilesArray, self.scene, loadBuildingModel)
            .then(() => {
                console.log('All building models loaded');
            })
            .catch(error => {
                console.error('Error loading building models:', error);
            });

        // Start rendering loop
        this.animate();
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));

        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // static loadMultipleJSONFiles(filesArray, scene, loaderFunction) {
    //     return filesArray.reduce((promise, file) => {
    //         return promise.then(() => {
    //             return fetch(file.trim())
    //                 .then(response => response.json())
    //                 .then(data => {
    //                     if (!data || !data.models) {
    //                         throw new Error(`Invalid JSON format or missing data in file ${file}`);
    //                     }

    //                     const models = data.models;

    //                     // Load all models
    //                     return Promise.all(models.map(modelInfo => loaderFunction(modelInfo, scene)));
    //                 })
    //                 .then(loadedModels => {
    //                     console.log(`Loaded ${loadedModels.length} models from ${file}`);
    //                 });
    //         });
    //     }, Promise.resolve());
    // }
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


// // Initialize when the DOM is fully loaded
// document.addEventListener('DOMContentLoaded', function () {
//     init();
// });
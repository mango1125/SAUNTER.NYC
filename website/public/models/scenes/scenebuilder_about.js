import { SceneBuilderBase } from './scenebuilder_base.js';

// class SceneBuilderBanner extends SceneBuilderBase {
    
//     constructor() {
//         super();
//         this.pivot = null;
//     }

//     init(modelHtmlTag='three-model') {
//         // Getting JSON files
//         const modelHtmlElement = document.getElementById(modelHtmlTag);
//         const modelJsonFiles = modelHtmlElement.getAttribute('data-model-json-files');

//         if (!modelJsonFiles) {
//             console.error('No JSON files specified in the data attribute');
//             return;
//         }

//         const modelFilesArray = modelJsonFiles.split(',');
//         const sizeX = modelHtmlTag.getAttribute('data-size-x');
//         const sizeY = modelHtmlTag.getAttribute('data-size-y');

//         // Renderer setup
//         this.renderer = new THREE.WebGLRenderer({
//             antialias: false,
//             logarithmicDepthBuffer: false
//         });
//         this.renderer.setSize(sizeX, sizeY);
//     }
// }

// // Initialize when the DOM is fully loaded
// document.addEventListener('DOMContentLoaded', function () {
//     const splashBanner = new SceneBuilderBanner();
//     splashBanner.init();
// });

document.addEventListener('DOMContentLoaded', function () {
    const splashBanner = new SceneBuilderBase();
    splashBanner.init('three-model', 0xf7f7f7, false);
});
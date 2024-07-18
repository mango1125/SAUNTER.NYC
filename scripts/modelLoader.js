import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// Function to load a model with its materials
export function loadBuildingModel(modelInfo, scene) {
    return new Promise((resolve, reject) => {
        const mtlLoader = new MTLLoader();
        mtlLoader.load(modelInfo.mtlPath, function (materials) {
            if (materials) {
                materials.preload();

                // Set texture filtering properties and handle alpha maps
                for (const materialName in materials.materials) {
                    const material = materials.materials[materialName];
                    material.side = THREE.DoubleSide;
                    if (material.map) {
                        material.map.magFilter = THREE.NearestFilter;
                        material.map.minFilter = THREE.LinearMipmapLinearFilter;

                        // Handle alpha maps
                        if (material.map.format === THREE.RGBAFormat) {
                            material.transparent = true;
                            material.alphaTest = 0.5; // Adjust as needed
                        }
                    }
                }

                const objLoader = new OBJLoader();
                objLoader.setMaterials(materials);

                objLoader.load(modelInfo.path, function (object) {
                    if (modelInfo.position) object.position.set(...modelInfo.position);
                    if (modelInfo.rotation) object.rotation.set(...modelInfo.rotation);
                    if (modelInfo.scale) object.scale.set(...modelInfo.scale);

                    scene.add(object);
                    resolve(object);
                }, undefined, function (error) {
                    console.error(`Error loading OBJ '${modelInfo.path}':`, error);
                    reject(error);
                });
            } else {
                console.error(`Error loading MTL '${modelInfo.mtlPath}': Invalid materials`);
                reject(new Error('Invalid materials format'));
            }
        }, undefined, function (error) {
            console.error(`Error loading MTL '${modelInfo.mtlPath}':`, error);
            reject(error);
        });
    });
}

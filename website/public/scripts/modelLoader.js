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
                    
                    // Apply transparency if specified in modelInfo
                    if (modelInfo.transparent) {
                        material.transparent = true;
                    }

                    // Apply side if specified in modelInfo, otherwise default to THREE.DoubleSide
                    if (modelInfo.side) {
                        if (modelInfo.side === 'BackSide') {
                            material.side = THREE.BackSide;
                        } else if (modelInfo.side === 'FrontSide') {
                            material.side = THREE.FrontSide;
                        } else {
                            material.side = THREE.DoubleSide;
                        }
                    } else {
                        material.side = THREE.DoubleSide;
                    }

                    // Apply depthWrite if specified in modelInfo
                    if (modelInfo.depthWrite === false) {
                        material.depthWrite = false;
                    }

                    if (material.map) {
                        material.map.anisotropy = 0;
                        material.map.magFilter = THREE.NearestFilter;
                        material.map.minFilter = THREE.NearestFilter;
                        
                        // Handle alpha maps
                        if (material.map.format === THREE.RGBAFormat) {
                            material.alphaTest = 0.5; // adjust as needed
                        }
                    }

                    if (material.alphaMap) {
                        material.alphaMap.magFilter = THREE.NearestFilter;
                        material.alphaMap.minFilter = THREE.NearestFilter;
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

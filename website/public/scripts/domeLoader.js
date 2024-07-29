import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

let lights; // Variable to store the lights mesh
let domeObjects = new THREE.Group(); // Variable to store dome objects

function reverseNormals(geometry) {
    if (!geometry.index) {
        const vertexCount = geometry.attributes.position.count;
        const indices = [];
        for (let i = 0; i < vertexCount; i++) {
            indices.push(i);
        }
        geometry.setIndex(indices);
    }

    const normals = geometry.attributes.normal;
    for (let i = 0; i < normals.count; i++) {
        normals.setXYZ(i, -normals.getX(i), -normals.getY(i), -normals.getZ(i));
    }
    normals.needsUpdate = true;

    const index = geometry.index;
    for (let i = 0; i < index.count; i += 3) {
        const tmp = index.array[i];
        index.array[i] = index.array[i + 2];
        index.array[i + 2] = tmp;
    }
    index.needsUpdate = true;
}

export function loadSkyboxModel(modelInfo, scene) {
    return new Promise((resolve, reject) => {
        const mtlLoader = new MTLLoader();
        mtlLoader.load(modelInfo.mtlPath, function (materials) {
            if (materials) {
                materials.preload();

                for (const materialName in materials.materials) {
                    const material = materials.materials[materialName];
                    material.side = THREE.FrontSide;
                    material.transparent = true;
                    material.opacity = modelInfo.opacity || 1.0;
                    material.depthWrite = false;

                    if (material.map) {
                        material.map.magFilter = THREE.NearestFilter;
                        material.map.minFilter = THREE.LinearMipmapLinearFilter;
                    }

                    if (modelInfo.alphaMapPath) {
                        const alphaMap = new THREE.TextureLoader().load(modelInfo.alphaMapPath);
                        alphaMap.magFilter = THREE.NearestFilter;
                        alphaMap.minFilter = THREE.LinearMipmapLinearFilter;
                        material.alphaMap = alphaMap;
                    }

                    if (modelInfo.emissiveMapPath) {
                        const emissiveMap = new THREE.TextureLoader().load(modelInfo.emissiveMapPath);
                        emissiveMap.magFilter = THREE.NearestFilter;
                        emissiveMap.minFilter = THREE.LinearMipmapLinearFilter;
                        material.emissiveMap = emissiveMap;
                        material.emissive = new THREE.Color(modelInfo.emissiveColor || '#000000');
                        material.emissiveIntensity = modelInfo.emissiveIntensity || 1.0;
                    }

                    material.blending = THREE[modelInfo.blending] || THREE.NormalBlending;
                }

                const objLoader = new OBJLoader();
                objLoader.setMaterials(materials);

                objLoader.load(modelInfo.path, function (object) {
                    object.traverse(function (child) {
                        if (child.isMesh) {
                            if (modelInfo.isLights) {
                                lights = child;
                                reverseNormals(child.geometry); // Reverse normals for lights
                            } else {
                                reverseNormals(child.geometry); // Reverse normals for non-lights
                            }

                            child.material.transparent = true;
                            child.material.opacity = modelInfo.opacity || 1.0;
                            child.material.depthWrite = false;
                        }
                    });

                    if (!modelInfo.isLights) { // Only add non-lights to domeObjects
                        domeObjects.add(object); // Add dome object to domeObjects group
                    }

                    if (modelInfo.position) object.position.set(...modelInfo.position);
                    if (modelInfo.rotation) object.rotation.set(...modelInfo.rotation);
                    if (modelInfo.scale) object.scale.set(...modelInfo.scale);

                    object.frustumCulled = true;
                    object.renderOrder = modelInfo.renderOrder !== undefined ? modelInfo.renderOrder : 0;

                    scene.add(object);

                    // Log child objects inside object.traverse for debugging
                    console.log(`Child objects of loaded model (${modelInfo.path}):`);
                    object.traverse(function (child) {
                        if (child.isMesh) {
                            console.log(child);
                        }
                    });

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

// Export the lights object and domeObjects specifically
export { lights, domeObjects };

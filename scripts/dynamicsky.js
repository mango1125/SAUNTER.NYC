// dynamicsky.js

import { lights } from './domeLoader.js';

let lightsObject; // Declare lightsObject variable

export function setLightsObject(lights) {
    lightsObject = lights; // Assign lights mesh to lightsObject variable
}

export function lightHandler(time) {
    // Ensure time is defined and within valid range
    if (time === undefined || time === null || isNaN(time)) {
        console.error('Invalid time value:', time);
        return;
    }

    // Function to update opacity based on time
    function updateOpacity(time) {
        let opacity;
        if (lightsObject) {
            opacity = Math.cos(time / 24 * Math.PI * 2) * 0.5 + 0.5;
        } else {
            console.warn('lightsObject is not defined');
            opacity = 1.0; // Default opacity if lightsObject is not defined
        }
        return opacity;
    }

    // Return the updateOpacity function for potential further use
    return updateOpacity(time);
}

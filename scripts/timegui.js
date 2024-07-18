// timegui.js

export function setupTimeGUI(onTimeChange) {
    const gui = new dat.GUI(); // Initialize dat.GUI

    const params = {
        time: 12, // Initial value
    };

    gui.add(params, 'time', 0, 24).name('Time').onChange(onTimeChange, { passive: true }); // Add { passive: true } to mark as passive
}
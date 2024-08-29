import OpenScad from "./openscad.js";
import { addFonts } from "./openscad.fonts.js";

self.onmessage = async (message) => {
  const startTime = performance.now();
  const outputs = [];
  try {
    const instance = await OpenScad({
      noInitialRun: true,
      print: (text) => {
        outputs.push(text);
      },
      printErr: (text) => {
        if (text !== "Could not initialize localization.") // It just happens so hide it from user
          outputs.push(text);
      },
    });
    addFonts(instance);
    instance.FS.writeFile("/input.scad", message.data.code);
    instance.callMain(["/input.scad", "-o", "cube.stl", ...message.data.parameters]);
    const data = instance.FS.readFile("/cube.stl");
    const endTime = performance.now();
    const time = endTime - startTime;

    self.postMessage({ data, outputs, time });
  } catch (e) {
    const endTime = performance.now();
    const time = endTime - startTime;
    self.postMessage({ data: null, outputs, time });
  }
};

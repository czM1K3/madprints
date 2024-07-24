import OpenScad from "./openscad.js";
import { addFonts } from "./openscad.fonts.js";

self.onmessage = async (message) => {
  const outputs = [];
  try {
    const instance = await OpenScad({
      noInitialRun: true,
      print: (text) => {
        outputs.push(text);
      },
      printErr: (text) => {
        outputs.push(text);
      },
    });
    addFonts(instance);
    instance.FS.writeFile("/input.scad", message.data.code);
    instance.callMain(["/input.scad", "-o", "cube.stl", ...message.data.parameters]);
    const data = instance.FS.readFile("/cube.stl");

    self.postMessage({ data, outputs });
  } catch (e) {
    self.postMessage({ data: null, outputs });
  }
};

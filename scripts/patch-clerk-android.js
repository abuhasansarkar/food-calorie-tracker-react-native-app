const fs = require("fs");
const path = require("path");

const possiblePaths = [
  path.join(__dirname, "..", "node_modules", "@clerk", "expo", "dist", "specs", "NativeClerkModule.android.js"),
  path.join(__dirname, "..", "node_modules", "@clerk", "expo", "build", "specs", "NativeClerkModule.android.js"),
  path.join(__dirname, "..", "node_modules", "@clerk", "expo", "src", "specs", "NativeClerkModule.android.ts"),
];

let patched = false;
for (const target of possiblePaths) {
  try {
    if (fs.existsSync(target)) {
      let content = fs.readFileSync(target, "utf8");
      const original = content;
      content = content.replaceAll
        ? content.replaceAll("requireNativeModule", "requireOptionalNativeModule")
        : content.split("requireNativeModule").join("requireOptionalNativeModule");
      if (content !== original) {
        fs.writeFileSync(target, content, "utf8");
        console.log(`✓ Patched ${path.relative(path.join(__dirname, ".."), target)}`);
        patched = true;
      } else {
        console.log(`→ Already patched ${path.basename(target)}`);
        patched = true;
      }
      break;
    }
  } catch (e) {
    console.warn(`⚠ Failed to patch ${target}: ${e.message}`);
  }
}

if (!patched) {
  console.warn("⚠ Clerk Android native module not found. The patch may not be needed for this version.");
}

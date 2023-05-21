import fs from "fs";
import lunr from "lunr";
import path from "path";

const idx = lunr(function () {
  this.ref("name");
  this.field("text");

  const readDir = (dir) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const url = fullPath
        .slice("src/pages".length, "-4")
        .replaceAll("\\", "/");

      if (fs.lstatSync(fullPath).isDirectory()) {
        readDir(fullPath);
      } else {
        if (file.endsWith(".mdx")) {
          const contents = fs.readFileSync(fullPath);
          this.add({
            name: url,
            text: contents.toString(),
          });
        }
      }
    }
  };

  readDir("src/pages");
});

fs.writeFileSync("src/lunrIndex.json", JSON.stringify(idx));

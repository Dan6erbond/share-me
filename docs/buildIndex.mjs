import fs from "fs";
import lunr from "lunr";
import path from "path";
import matter from "gray-matter";

const readDir = (dir, pages = []) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    let url = fullPath.slice("src/pages".length, "-4").replaceAll("\\", "/");

    if (url.endsWith("/index")) {
      url = url.slice(0, 0 - "/index".length);
    }

    if (fs.lstatSync(fullPath).isDirectory()) {
      readDir(fullPath, pages);
    } else {
      if (file.endsWith(".mdx")) {
        const contents = fs.readFileSync(fullPath);

        const { data: meta } = matter(contents);

        pages.push({
          path: url,
          title: meta.title ?? url,
          text: contents.toString(),
        });
      }
    }
  }

  return pages;
};

const pages = readDir("src/pages");

const idx = lunr(function () {
  this.ref("path");

  this.field("title");
  this.field("text");

  this.metadataWhitelist = ["position"];

  for (const page of pages) {
    this.add(page);
  }
});

fs.writeFileSync("src/lunrIndex.json", JSON.stringify(idx));

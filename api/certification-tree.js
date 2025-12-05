const fs = require("fs");
const path = require("path");

function buildTree(dirPath, relPath = "") {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const dirs = [];
  const files = [];

  for (const entry of entries) {
    // skip hidden files/folders like .DS_Store
    if (entry.name.startsWith(".")) continue;

    const fullPath = path.join(dirPath, entry.name);
    const entryRelPath = relPath ? `${relPath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const subtree = buildTree(fullPath, entryRelPath);
      dirs.push({
        type: "folder",
        name: entry.name,
        children: subtree.children,
      });
    } else {
      // don’t include Certification/index.html itself
      if (
        entry.name.toLowerCase() === "index.html" &&
        relPath === ""
      ) {
        continue;
      }

      files.push({
        type: "file",
        name: entry.name,
        path: `/Certification/${entryRelPath}`,
      });
    }
  }

  // sort: folders first, then files, alphabetically
  dirs.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  files.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  return { type: "folder", name: "Certification", children: [...dirs, ...files] };
}

module.exports = (req, res) => {
  try {
    const rootDir = path.join(process.cwd(), "Certification");
    const tree = buildTree(rootDir);
    res.status(200).json(tree);
  } catch (err) {
    console.error("Error building certification tree:", err);
    res.status(500).json({ error: "Failed to build certification tree" });
  }
};

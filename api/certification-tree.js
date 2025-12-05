const OWNER = "OMC-NZ";
const REPO = "Konec-Aqara-Exhibition";
const BRANCH = "main";

// Helper to build GitHub API URL for a path
function buildGithubUrl(path) {
  const encodedPath = path
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath}?ref=${encodeURIComponent(BRANCH)}`;
}

async function fetchDir(path) {
  const token = process.env.GITHUB_TOKEN;
  const url = buildGithubUrl(path);

  const headers = {
    "User-Agent": "aqarahome-certifications",
    "Accept": "application/vnd.github.v3+json",
  };

  // Use token if available (much higher rate limit)
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(url, { headers });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GitHub ${resp.status}: ${text}`);
  }

  return resp.json();
}

async function buildTree(path) {
  const items = await fetchDir(path);

  const dirs = items.filter((i) => i.type === "dir");
  const files = items.filter((i) => i.type === "file");

  // Sort alphabetically (folders then files)
  dirs.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  files.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  const children = [];

  // FOLDERS (recurse)
  for (const dir of dirs) {
    const subtree = await buildTree(dir.path);
    children.push({
      type: "folder",
      name: dir.name,
      children: subtree.children,
    });
  }

  // FILES
  for (const file of files) {
    // Hide Certification/index.html itself
    if (file.path === "Certification/index.html") {
      continue;
    }

    children.push({
      type: "file",
      name: file.name,
      // file.path is like "Certification/..."; we want "/Certification/..."
      path: "/" + file.path,
    });
  }

  return {
    type: "folder",
    name: path.split("/").pop() || path,
    children,
  };
}

// Vercel serverless function entry point
module.exports = async (req, res) => {
  try {
    const tree = await buildTree("Certification");

    // Allow Vercel to cache at the edge a bit
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

    res.status(200).json(tree);
  } catch (err) {
    console.error("Error building certification tree:", err);
    res.status(500).json({ error: "Failed to build certification tree" });
  }
};

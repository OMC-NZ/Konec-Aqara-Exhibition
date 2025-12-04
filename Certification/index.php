<?php
/**
 * Recursively render the folder/file tree starting from $dir.
 *
 * @param string $dir      Filesystem path to scan
 * @param string $webPath  Relative web path (for links)
 */
function renderDirectoryTree(string $dir, string $webPath = ''): void
{
    // Get directory contents and remove "." and ".."
    $entries = array_diff(scandir($dir), ['.', '..']);

    $directories = [];
    $files = [];

    foreach ($entries as $entry) {
        // Skip hidden files/folders (optional)
        if (strpos($entry, '.') === 0) {
            continue;
        }

        $fullPath = $dir . DIRECTORY_SEPARATOR . $entry;

        // Build the relative web path for this entry
        $entryWebPath = ($webPath === '') ? $entry : $webPath . '/' . $entry;

        if (is_dir($fullPath)) {
            $directories[$entry] = $entryWebPath;
        } else {
            // Skip this script file so it doesn't show up in the list
            if ($entry === basename(__FILE__)) {
                continue;
            }
            $files[$entry] = $entryWebPath;
        }
    }

    // Sort folders and files alphabetically
    ksort($directories, SORT_NATURAL | SORT_FLAG_CASE);
    ksort($files, SORT_NATURAL | SORT_FLAG_CASE);

    // First render folders, then files
    foreach ($directories as $name => $path) {
        $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');

        echo '<li class="folder">';
        echo '  <div class="folder-header">' . $safeName . '</div>';
        echo '  <ul class="children">';
        renderDirectoryTree($dir . DIRECTORY_SEPARATOR . $name, $path);
        echo '  </ul>';
        echo '</li>';
    }

    foreach ($files as $name => $path) {
        $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
        $safeHref = htmlspecialchars($path, ENT_QUOTES, 'UTF-8');

        echo '<li class="file">';
        echo '  <a href="' . $safeHref . '" target="_blank" rel="noopener noreferrer">';
        echo        $safeName;
        echo '  </a>';
        echo '</li>';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Aqara Aus/NZ Certifications</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            margin: 0;
            padding: 0;
            background: #f5f5f7;
            color: #111827;
        }

        .page {
            max-width: 900px;
            margin: 40px auto;
            padding: 20px 24px 32px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        }

        h1 {
            font-size: 1.75rem;
            margin: 0 0 20px;
            text-align: center;
        }

        .tree {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .tree li {
            margin: 2px 0;
        }

        /* Folders */

        .folder > .folder-header {
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 6px;
            user-select: none;
            display: inline-flex;
            align-items: center;
        }

        .folder > .folder-header:hover {
            background: #f3f4f6;
        }

        .folder > .folder-header::before {
            content: "▶";
            display: inline-block;
            width: 1em;
            margin-right: 4px;
            font-size: 0.85em;
            transform-origin: center;
        }

        .folder.open > .folder-header::before {
            content: "▼";
        }

        .folder > .children {
            list-style: none;
            margin: 2px 0 2px 20px;
            padding-left: 10px;
            border-left: 1px solid #e5e7eb;
            display: none; /* collapsed by default */
        }

        .folder.open > .children {
            display: block;
        }

        /* Files */

        .file a {
            text-decoration: none;
            color: #1f2933;
            padding: 3px 8px;
            border-radius: 6px;
            display: inline-block;
        }

        .file a:hover {
            background: #e5f0ff;
            text-decoration: underline;
        }

        .note {
            margin-top: 10px;
            font-size: 0.85rem;
            color: #6b7280;
            text-align: center;
        }

        @media (max-width: 600px) {
            .page {
                margin: 16px;
                padding: 16px;
            }

            h1 {
                font-size: 1.4rem;
            }
        }
    </style>
</head>
<body>
<div class="page">
    <h1>Aqara Aus/NZ Certifications</h1>

    <ul class="tree">
        <?php
        // Start from the current directory (the Certification folder)
        renderDirectoryTree(__DIR__);
        ?>
    </ul>

    <p class="note">
        Click a folder to expand it. Click a file name to open it in a new tab.
    </p>
</div>

<script>
    // Attach click handlers to all folder headers for expand/collapse
    document.addEventListener('DOMContentLoaded', function () {
        var folderHeaders = document.querySelectorAll('.folder > .folder-header');

        folderHeaders.forEach(function (header) {
            header.addEventListener('click', function () {
                var li = header.parentElement;
                li.classList.toggle('open');
            });
        });
    });
</script>
</body>
</html>

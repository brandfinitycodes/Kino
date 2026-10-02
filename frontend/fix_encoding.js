const fs = require('fs');
const path = require('path');

const replacements = {
    "ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹": "₹",
    "ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¤": "👤",
    "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ": "—",
    "ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢": "→",
    "ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦": "★",
    "ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦": "…",
    "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢": "’",
    "ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢": "™",
    "ÃƒÂ‚Ã‚Â©": "©",
    "ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢": "•",
    "ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬": "€",
    "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“": "–",
    "ÃƒÂ¢Ã¢â€šÂ¬": "—",
    "ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ": " ",
    "Ãƒâ€šÃ‚Â·": "·",
    "ÃƒÂ¢Ã¢â‚¬â€ Ã‚Â ": "►",
    "ÃƒÂ¢Ã…â€™Ã¢â‚¬Å¾": "⌚",
    "ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“": "✓",
    "ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Å“": "↓",
    "ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Â¹": "👋",
    "Ãƒâ€šÃ‚Â©": "©"
};

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            for (let [oldStr, newStr] of Object.entries(replacements)) {
                if (content.includes(oldStr)) {
                    content = content.split(oldStr).join(newStr);
                    changed = true;
                }
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log("Fixed: " + fullPath);
            }
        }
    });
}

walkDir(path.join(__dirname, 'src'));

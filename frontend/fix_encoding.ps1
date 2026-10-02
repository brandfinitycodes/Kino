    $files = Get-ChildItem -Path "c:\Users\ASUS\Desktop\influencerHUB\influencer-hub\frontend\src" -Recurse -Include *.jsx
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    
    $orig = $content
    $content = $content.Replace("ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¹", "₹")
    $content = $content.Replace("ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¤", "👤")
    $content = $content.Replace("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ", "—")
    $content = $content.Replace("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢", "→")
    $content = $content.Replace("ÃƒÂ¢Ã‹Å“Ã¢â‚¬Â¦", "★")
    $content = $content.Replace("ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦", "…")
    $content = $content.Replace("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢", "’")
    $content = $content.Replace("ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢", "™")
    $content = $content.Replace("ÃƒÂ‚Ã‚Â©", "©")
    $content = $content.Replace("ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢", "•")
    $content = $content.Replace("ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬", "€")
    $content = $content.Replace("ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“", "–")
    $content = $content.Replace("ÃƒÂ¢Ã¢â€šÂ¬", "—")
    $content = $content.Replace("ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ", " ")
    $content = $content.Replace("Ãƒâ€šÃ‚Â·", "·")
    $content = $content.Replace("ÃƒÂ¢Ã¢â‚¬â€ Ã‚Â ", "►")
    $content = $content.Replace("ÃƒÂ¢Ã…â€™Ã¢â‚¬Å¾", "⌚")
    $content = $content.Replace("ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“", "✓")
    $content = $content.Replace("ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Å“", "↓")
    $content = $content.Replace("ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Â¹", "👋")
    $content = $content.Replace("Ãƒâ€šÃ‚Â©", "©")
    
    if ($content -cne $orig) {
        [System.IO.File]::WriteAllText($f.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed: $($f.FullName)"
    }
}

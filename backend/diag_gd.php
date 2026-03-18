<?php
echo "GD Support: " . (extension_loaded('gd') ? "ENABLED" : "DISABLED") . "\n";
if (extension_loaded('gd')) {
    $info = gd_info();
    echo "WebP Read Support: " . ($info['WebP Support'] ? "YES" : "NO") . "\n";
    echo "WebP Write Support: " . ($info['WebP Support'] ? "YES" : "NO") . "\n";
}
echo "imagecreatefromwebp exists: " . (function_exists('imagecreatefromwebp') ? "YES" : "NO") . "\n";
?>

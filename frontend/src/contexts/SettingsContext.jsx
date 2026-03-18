import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSettings } from '@/services/api';

export const SettingsContext = createContext({
    settings: {},
    loading: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const hexToHsl = (hex) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = "0x" + hex[1] + hex[1];
            g = "0x" + hex[2] + hex[2];
            b = "0x" + hex[3] + hex[3];
        } else if (hex.length === 7) {
            r = "0x" + hex[1] + hex[2];
            g = "0x" + hex[3] + hex[4];
            b = "0x" + hex[5] + hex[6];
        }
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;
        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);
        return `${h} ${s}% ${l}%`;
    };

    const loadFont = (fontName) => {
        const fontId = 'dynamic-font-link';
        let link = document.getElementById(fontId);
        if (!link) {
            link = document.createElement('link');
            link.id = fontId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        const formattedName = fontName.replace(/\s+/g, '+');
        link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700;800;900&display=swap`;
        document.body.style.fontFamily = `'${fontName}', sans-serif`;
    };

    const updateSystemVisuals = (color, font) => {
        if (color && color.startsWith('#')) {
            try {
                const hslValue = hexToHsl(color);
                document.documentElement.style.setProperty('--primary', hslValue);
                document.documentElement.style.setProperty('--ring', hslValue);
            } catch (e) {
                console.error("Invalid color format during visual update");
            }
        }
        if (font) {
            loadFont(font);
            document.documentElement.style.setProperty('--primary-font', `'${font}', sans-serif`);
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await getSettings();
            if (response && response.data) {
                setSettings(response.data);
                updateSystemVisuals(response.data.primary_color, response.data.primary_font || 'Plus Jakarta Sans');
            } else {
                setSettings({});
                loadFont('Plus Jakarta Sans');
            }
        } catch (error) {
            console.error("Failed to fetch site settings:", error);
            setSettings({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const refreshSettings = () => {
        setLoading(true);
        fetchSettings();
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, loadFont, updateSystemVisuals, hexToHsl, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};



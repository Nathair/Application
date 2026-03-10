export const getTagStyle = (tagName: string) => {
    const name = tagName.toLowerCase();
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use HSL for controlled, non-"eyewatering" colors
    // Hue: 0-360 based on hash
    // Saturation: 60-80% for vibrant but not too neon
    // Lightness: 90-95% for very light backgrounds (pastel)
    const h = Math.abs(hash) % 360;
    const s = 70;
    const l = 93;

    // Border and text color should be darker version of the same hue
    const borderL = 85;
    const textL = 30;

    return {
        backgroundColor: `hsl(${h}, ${s}%, ${l}%)`,
        borderColor: `hsl(${h}, ${s}%, ${borderL}%)`,
        color: `hsl(${h}, ${s}%, ${textL}%)`,
    };
};

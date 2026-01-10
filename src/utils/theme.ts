export const applyThemeStyles = (mode: string, config?: any) => {
    // Basic Theme Attribute
    document.documentElement.setAttribute('data-theme', mode);



    // Helper to get from storage if config is missing
    const getVal = (key: string, defaultVal: string) => localStorage.getItem(key) || defaultVal;

    // Apply Font
    const storedFontFamily = getVal('fontFamily', "'Noto Sans KR', sans-serif");
    const storedFontSize = getVal('fontSize', "16px");

    // Use config if provided, else fallback to storage
    const fontFamily = config?.font?.family || storedFontFamily;
    const fontSize = config?.font?.size || storedFontSize;

    document.documentElement.style.setProperty('--font-family', fontFamily);
    document.documentElement.style.setProperty('--font-size', fontSize);

    // Apply Manual Config if mode is manual
    if (mode === 'manual') {
        const manualConfig = config?.manualConfig;

        // Text
        const textColor = manualConfig?.text?.color || getVal('manualTextColor', '#1a1a1a');
        const textIntensity = manualConfig?.text?.intensity ?? parseInt(getVal('manualTextIntensity', '100'));

        const tr = parseInt(textColor.slice(1, 3), 16);
        const tg = parseInt(textColor.slice(3, 5), 16);
        const tb = parseInt(textColor.slice(5, 7), 16);
        document.documentElement.style.setProperty('--manual-text-color', `${tr}, ${tg}, ${tb}`);
        document.documentElement.style.setProperty('--manual-text-intensity', `${textIntensity / 100}`);

        // Background
        const bgImage = manualConfig?.background?.image || getVal('manualBgImage', '');
        const isGradient = manualConfig?.background?.isGradient ?? (getVal('manualIsGradient', 'false') === 'true');
        const bgSize = manualConfig?.background?.size || getVal('manualBgSize', 'cover');

        if (bgImage) {
            document.documentElement.style.setProperty('--manual-gradient', `url(${bgImage})`);
            document.documentElement.style.setProperty('--manual-bg-intensity', '0');
            document.documentElement.style.setProperty('--manual-bg-size', bgSize === 'repeat' ? 'auto' : bgSize);
            document.documentElement.style.setProperty('--manual-bg-repeat', bgSize === 'repeat' ? 'repeat' : 'no-repeat');
        } else if (isGradient) {
            const dir = manualConfig?.background?.gradientDirection || getVal('manualGradientDirection', 'to bottom right');
            const start = manualConfig?.background?.gradientStart || getVal('manualGradientStartColor', '#ffffff');
            const end = manualConfig?.background?.gradientEnd || getVal('manualGradientEndColor', '#3b82f6');

            document.documentElement.style.setProperty('--manual-gradient', `linear-gradient(${dir}, ${start}, ${end})`);
            document.documentElement.style.setProperty('--manual-bg-intensity', '1');
            document.documentElement.style.setProperty('--manual-bg-size', 'cover');
            document.documentElement.style.setProperty('--manual-bg-repeat', 'no-repeat');
        } else {
            const bgColor = manualConfig?.background?.color || getVal('manualBgColor', '#ffffff');
            const bgIntensity = manualConfig?.background?.intensity ?? parseInt(getVal('manualBgIntensity', '100'));

            document.documentElement.style.setProperty('--manual-gradient', 'none');
            const r = parseInt(bgColor.slice(1, 3), 16);
            const g = parseInt(bgColor.slice(3, 5), 16);
            const b = parseInt(bgColor.slice(5, 7), 16);
            document.documentElement.style.setProperty('--manual-bg-color', `${r}, ${g}, ${b}`);
            document.documentElement.style.setProperty('--manual-bg-intensity', `${bgIntensity / 100}`);
            document.documentElement.style.setProperty('--manual-bg-size', 'cover');
            document.documentElement.style.setProperty('--manual-bg-repeat', 'no-repeat');
        }

        // Component
        const cardColor = manualConfig?.component?.cardColor || getVal('manualCardColor', '#ffffff');
        const cr = parseInt(cardColor.slice(1, 3), 16);
        const cg = parseInt(cardColor.slice(3, 5), 16);
        const cb = parseInt(cardColor.slice(5, 7), 16);
        document.documentElement.style.setProperty('--manual-card-color', `${cr}, ${cg}, ${cb}`);

        const btnColor = manualConfig?.component?.btnColor || getVal('manualBtnColor', '#2563eb');
        const btnTextColor = manualConfig?.component?.btnTextColor || getVal('manualBtnTextColor', '#ffffff');
        document.documentElement.style.setProperty('--manual-btn-bg', btnColor);
        document.documentElement.style.setProperty('--manual-btn-text', btnTextColor);
    }
};

export const saveThemeToLocalStorage = (data: any) => {
    if (!data) return;
    const themeData = data.theme;
    if (!themeData) return;

    localStorage.setItem('theme', themeData.mode);
    if (themeData.font) {
        localStorage.setItem('fontFamily', themeData.font.family);
        localStorage.setItem('fontSize', themeData.font.size);
    }

    if (themeData.manualConfig) {
        const mc = themeData.manualConfig;
        if (mc.text) {
            localStorage.setItem('manualTextColor', mc.text.color);
            localStorage.setItem('manualTextIntensity', mc.text.intensity.toString());
        }
        if (mc.background) {
            localStorage.setItem('manualIsGradient', mc.background.isGradient.toString());
            localStorage.setItem('manualBgColor', mc.background.color);
            localStorage.setItem('manualBgIntensity', mc.background.intensity.toString());
            localStorage.setItem('manualGradientDirection', mc.background.gradientDirection);
            localStorage.setItem('manualGradientStartColor', mc.background.gradientStart);
            localStorage.setItem('manualGradientEndColor', mc.background.gradientEnd);
            localStorage.setItem('manualBgImage', mc.background.image);
            localStorage.setItem('manualBgSize', mc.background.size);
        }
        if (mc.component) {
            localStorage.setItem('manualCardColor', mc.component.cardColor);
            localStorage.setItem('manualBtnColor', mc.component.btnColor);
            localStorage.setItem('manualBtnTextColor', mc.component.btnTextColor);
        }
    }
};

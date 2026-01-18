// Theme Configuration Manager
// ไฟล์จัดการธีมร่วมสำหรับทุกหน้า

class ThemeManager {
    static init() {
        // Mark that ThemeManager is loaded
        window.themeManagerLoaded = true;
        
        // Apply theme immediately to prevent flash
        this.applyTheme();
        
        // Also apply on DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyTheme());
        }
    }
    
    static applyTheme() {
        const savedDefaultTheme = localStorage.getItem('defaultTheme');
        const savedDarkMode = localStorage.getItem('darkMode');
        
        let isDark;
        
        if (savedDefaultTheme) {
            // ใช้ค่าจาก login page ที่ผู้ใช้เลือก
            isDark = savedDefaultTheme === 'dark';
            console.log('Using defaultTheme:', savedDefaultTheme);
        } else if (savedDarkMode) {
            // ใช้ค่าเก่า (สำรอง)
            isDark = savedDarkMode === 'true';
            console.log('Using darkMode:', savedDarkMode);
        } else {
            // ค่าเริ่มต้นสำหรับหน้าอื่น (dark)
            isDark = true;
            console.log('Using default: dark');
        }
        
        // Apply theme
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        console.log('Theme applied:', isDark ? 'dark' : 'light');
    }
    
    static setTheme(theme) {
        // Set both variables to ensure consistency
        localStorage.setItem('defaultTheme', theme);
        localStorage.setItem('darkMode', theme === 'dark' ? 'true' : 'false');
        
        // Apply theme immediately
        this.applyTheme();
        
        console.log('Theme set to:', theme);
    }
    
    static getCurrentTheme() {
        return localStorage.getItem('defaultTheme') || 
               (localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light');
    }
}

// Auto-initialize when script loads
ThemeManager.init();

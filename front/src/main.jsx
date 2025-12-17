/**
 * ملف الإعدادات الرئيسي لـ React
 * هنا بنربط التطبيق بالـ DOM
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}

// الحصول على العنصر الرئيسي في الصفحة
const rootElement = document.getElementById('root')

// إنشاء وتشغيل التطبيق
createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>
)

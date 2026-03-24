import { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        site_name: 'Aamya Holidays',
        logo_url: '',
        logo_text: '✈️ Aamya Holidays',
        hero_heading: 'Discover the Extraordinary.',
        hero_subheading: 'Journeys tailored to your wildest dreams and expectations.',
        hero_bg_image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80',
        contact_email: 'hello@aamya.holidays',
        contact_phone: '+1 (800) 123-4567',
        whatsapp_number: '+18001234567',
        footer_text: 'We curate premium, life-changing travel experiences to the world\'s most spectacular destinations. Unleash your wanderlust.',
        social_facebook: '',
        social_instagram: '',
        social_twitter: ''
    });

    const [loading, setLoading] = useState(true);

    const refreshSettings = () => {
        setLoading(true);
        fetch(((window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) ? 'http://localhost/aamya_holiday/backend/public/api/settings' : '/backend/public/api/settings'))
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && Object.keys(data.data).length > 0) {
                    setSettings(prev => ({ ...prev, ...data.data }));
                }
            })
            .catch(err => console.error("Error fetching settings:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

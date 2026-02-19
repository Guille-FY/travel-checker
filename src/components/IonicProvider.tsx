'use client';

import { setupIonicReact, IonApp } from '@ionic/react';
import { useEffect, useState } from 'react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
// import '@ionic/react/css/padding.css';
// import '@ionic/react/css/float-elements.css';
// import '@ionic/react/css/text-alignment.css';
// import '@ionic/react/css/text-transformation.css';
// import '@ionic/react/css/flex-utils.css';
// import '@ionic/react/css/display.css';

/* Theme variables */
// import '../theme/variables.css'; 

setupIonicReact();

export default function IonicProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    // If we're on the server, we might return null or just the children without IonApp if needed.
    // However, Ionic works best as a SPA.
    // To prevent the hydration mismatch specific to Ionic's class manipulation on body:
    if (!mounted) return null;

    return (
        <IonApp>
            {children}
        </IonApp>
    );
}

import { useState, useEffect } from 'react';

interface DeviceOrientation {
  alpha: number;
  beta: number;
  gamma: number;
  hasPermission: boolean;
  isSupported: boolean;
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    hasPermission: false,
    isSupported: false,
  });

  useEffect(() => {
    const isSupported = 'DeviceOrientationEvent' in window;
    setOrientation(prev => ({ ...prev, isSupported }));

    if (!isSupported) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
        hasPermission: true,
        isSupported: true,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setOrientation(prev => ({ ...prev, hasPermission: true }));
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
      }
    } else {
      setOrientation(prev => ({ ...prev, hasPermission: true }));
    }
  };

  return { ...orientation, requestPermission };
};

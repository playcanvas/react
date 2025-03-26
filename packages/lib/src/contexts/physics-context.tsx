import React, { createContext, useContext, useEffect, useState } from 'react';

interface PhysicsContextType {
  isPhysicsEnabled: boolean;
  isPhysicsLoaded: boolean;
  physicsError: Error | null;
}

const PhysicsContext = createContext<PhysicsContextType>({
  isPhysicsEnabled: false,
  isPhysicsLoaded: false,
  physicsError: null,
});

export const usePhysics = () => useContext(PhysicsContext);

interface PhysicsProviderProps {
  children: React.ReactNode;
  enabled: boolean;
}

export const PhysicsProvider: React.FC<PhysicsProviderProps> = ({ children, enabled }) => {
  const [isPhysicsLoaded, setIsPhysicsLoaded] = useState(false);
  const [physicsError, setPhysicsError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsPhysicsLoaded(false);
      setPhysicsError(null);
      return;
    }

    const loadPhysics = async () => {
      try {
        const Ammo = await import('sync-ammo');
        // @ts-expect-error The PC Physics system expects a global Ammo instance
        globalThis.Ammo = Ammo.default;
        setIsPhysicsLoaded(true);
        setPhysicsError(null);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load physics library');
        setPhysicsError(err);
        setIsPhysicsLoaded(false);
      }
    };

    loadPhysics();

    return () => {
      // @ts-expect-error Clean up the global Ammo instance
      if (globalThis.Ammo) delete globalThis.Ammo;
    };
  }, [enabled]);

  return (
    <PhysicsContext.Provider
      value={{
        isPhysicsEnabled: enabled,
        isPhysicsLoaded,
        physicsError,
      }}
    >
      {children}
    </PhysicsContext.Provider>
  );
}; 
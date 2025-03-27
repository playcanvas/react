import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApp } from '../hooks';
import { AppBase } from 'playcanvas';

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

// Track how many Application instances are using physics
let physicsInstanceCount = 0;

export const usePhysics = () => useContext(PhysicsContext);

interface PhysicsProviderProps {
  children: React.ReactNode;
  enabled: boolean;
  app: AppBase;
}

export const PhysicsProvider: React.FC<PhysicsProviderProps> = ({ children, enabled, app }) => {
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
        // @ts-expect-error The PC Physics system expects a global Ammo instance
        if (!globalThis.Ammo) {
          const Ammo = await import('sync-ammo');
          // @ts-expect-error The PC Physics system expects a global Ammo instance
          globalThis.Ammo = Ammo.default;
        }
        
        // Only inititialie the library if not already done so
        if(!app.systems.rigidbody?.dispatcher) {
          app.systems.rigidbody?.onLibraryLoaded();
        }

        setIsPhysicsLoaded(true);
        setPhysicsError(null);
        physicsInstanceCount++;

      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load physics library');
        setPhysicsError(err);
        setIsPhysicsLoaded(false);
      }
    };

    loadPhysics();

    return () => {
      // Only clean up Ammo if this is the last instance using physics
      if (enabled) {
        physicsInstanceCount--;
        if (physicsInstanceCount === 0) {
          // @ts-expect-error Clean up the global Ammo instance
          if (globalThis.Ammo) delete globalThis.Ammo;
        }
      }
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
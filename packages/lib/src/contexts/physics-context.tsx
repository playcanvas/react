import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppBase } from 'playcanvas';

/**
 * Physics context type containing physics state information.
 */
export interface PhysicsContextType {
  /**
   * Whether physics is enabled on the application.
   */
  isPhysicsEnabled: boolean;
  /**
   * Whether the physics library has been successfully loaded.
   */
  isPhysicsLoaded: boolean;
  /**
   * The error that occurred when loading physics, if any.
   */
  physicsError: Error | null;
}

const PhysicsContext = createContext<PhysicsContextType>({
  isPhysicsEnabled: false,
  isPhysicsLoaded: false,
  physicsError: null,
});

// Track how many Application instances are using physics
let physicsInstanceCount = 0;

/**
 * Hook to access physics context information.
 * 
 * @returns Physics context containing physics state information
 * 
 * @example
 * ```tsx
 * import { usePhysics } from '@playcanvas/react/hooks';
 * 
 * const MyComponent = () => {
 *   const { isPhysicsEnabled, isPhysicsLoaded, physicsError } = usePhysics();
 * 
 *   if (physicsError) {
 *     return <div>Physics error: {physicsError.message}</div>;
 *   }
 * 
 *   if (!isPhysicsLoaded) {
 *     return <div>Loading physics...</div>;
 *   }
 * 
 *   return <div>Physics is ready!</div>;
 * };
 * ```
 */
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
        
        // Only initialize the library if not already done so
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
  }, [enabled, app]);

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
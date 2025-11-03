"use client";

import { createContext } from 'react';
import { GltfSceneContextValue } from './types.ts';

/**
 * Context for GltfScene
 * Provides access to the hierarchy cache and rule registration
 */
export const GltfSceneContext = createContext<GltfSceneContextValue | null>(null);


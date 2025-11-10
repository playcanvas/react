"use client";

import { createContext } from 'react';
import { GltfContextValue } from './types.ts';

/**
 * Context for Gltf
 * Provides access to the hierarchy cache and rule registration
 */
export const GltfContext = createContext<GltfContextValue | null>(null);


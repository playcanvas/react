"use client";

import React from 'react';
import { ModifyLightProps } from '../types.ts';

/**
 * Modify.Light component for modifying existing light components on matched entities
 * Must be a child of <Modify.Node>
 * 
 * @example
 * ```tsx
 * // Remove a light component
 * <Modify.Light remove />
 * 
 * // Modify light properties
 * <Modify.Light color="red" intensity={2} />
 * 
 * // Functional update
 * <Modify.Light intensity={(val) => val * 2} />
 * ```
 */
export const ModifyLight: React.FC<ModifyLightProps> = () => {
  // This component only exists to be processed by ModifyNode
  // It should never actually render
  return null;
};

ModifyLight.displayName = 'ModifyLight';


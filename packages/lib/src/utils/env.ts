/**
 * Browser safe environment var.
 */
export const env = typeof process !== 'undefined' && process?.env?.NODE_ENV
  ? process.env.NODE_ENV
  : 'production';
import * as pc from 'playcanvas';

export type PublicMutableNoFunctions<T> = {
    -readonly [K in keyof T 
      // 1) Exclude keys starting with `_`
      as K extends `_${string}` 
        ? never
  
        // 2) Exclude keys whose type is a function
        : T[K] extends Function 
          ? never
          : K
    ]: T[K];
  };
  
  // Make everything optional by wrapping it with Partial
export type OptionalPublicMutableNoFunctions<T> = Partial<PublicMutableNoFunctions<T>>;

export type Entity = OptionalPublicMutableNoFunctions<pc.Entity>;

export interface PlayCanvas {
    entity: any
}

declare global {
    namespace JSX {
      interface IntrinsicElements extends PlayCanvas {}
    }
}
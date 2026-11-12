// Kit objek: satu cahaya per episode, bentuk bermaterial, bayangan kontak, kedalaman. Aturan: docs/TATA-OBJEK.md.
export { LightProvider, useLight, makeLight, dropShadow, type Light } from './light';
export { Shaded, type Material, type ShadedProps } from './Shaded';
export { ContactShadow, depthStyle } from './ContactShadow';
export { rectPath, ellipsePath, pouchPath, blobPath, cupPath } from './shapes';

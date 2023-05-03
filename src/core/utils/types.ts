import '@total-typescript/ts-reset';

export type Modify<T, R> = Omit<T, keyof R> & R;

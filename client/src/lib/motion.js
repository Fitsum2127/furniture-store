// Change these numbers to make the whole site faster or slower.
export const EASE = [0.22, 1, 0.36, 1]; // gentle start, soft landing

export const slow = (delay = 0) => ({ duration: 1.2, ease: EASE, delay });
export const slower = (delay = 0) => ({ duration: 1.6, ease: EASE, delay });
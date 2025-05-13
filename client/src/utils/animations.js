import { gsap } from "gsap";

export const fadeIn = (element, duration = 0.5, delay = 0) => {
  return gsap.fromTo(
    element,
    { opacity: 0 },
    {
      opacity: 1,
      duration,
      delay,
      ease: "power2.out",
    }
  );
};

export const fadeOut = (element, duration = 0.5, delay = 0) => {
  return gsap.to(element, {
    opacity: 0,
    duration,
    delay,
    ease: "power2.in",
  });
};

export const slideInRight = (
  element,
  duration = 0.5,
  delay = 0,
  distance = 50
) => {
  return gsap.fromTo(
    element,
    {
      x: distance,
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration,
      delay,
      ease: "power2.out",
    }
  );
};

export const slideInLeft = (
  element,
  duration = 0.5,
  delay = 0,
  distance = 50
) => {
  return gsap.fromTo(
    element,
    {
      x: -distance,
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration,
      delay,
      ease: "power2.out",
    }
  );
};

export const staggerItems = (elements, duration = 0.5, stagger = 0.1) => {
  return gsap.fromTo(
    elements,
    {
      y: 20,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration,
      stagger,
      ease: "power2.out",
    }
  );
};

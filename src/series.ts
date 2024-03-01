import { snode, sempty, Stream } from "../include/stream.js";

export type Series = Stream<number>;

export function addSeries(s: Series, t: Series): Series {
  // TODO
  if (s.isEmpty()) {
    return t;
  }
  if (t.isEmpty()) {
    return s;
  }
  const head = s.head() + t.head();
  const tailFactory = () => addSeries(s.tail(), t.tail());
  return snode(head, tailFactory);
}

export function prodSeries(s: Series, t: Series): Series {
  // TODO
  if (s.isEmpty()) {
    return sempty();
  }
  function multiplySeries(s: Series, t: Series): Series {
    if (t.isEmpty()) {
      return sempty();
    }
    return snode(s.head() * t.head(), () => multiplySeries(s, t.tail()));
  }
  return snode(multiplySeries(s, t).head(), () => addSeries(multiplySeries(s, t).tail(), prodSeries(s.tail(), t)));
}

export function derivSeries(s: Series): Series {
  // TODO
  function computeDerivative(s: Series, n: number): Series {
    if (s.isEmpty()) {
      return sempty();
    } else {
      const head = n * s.head();
      const tail = computeDerivative(s.tail(), n + 1);
      return snode(head, () => tail);
    }
  }
  return computeDerivative(s.tail(), 1);
}

export function coeff(s: Series, n: number): number[] {
  // TODO
  function extractCoefficients(s: Series, n: number, result: number[]): number[] {
    if (n < 0 || s.isEmpty()) {
      return result;
    } else {
      result.push(s.head());
      return extractCoefficients(s.tail(), n - 1, result);
    }
  }
  return extractCoefficients(s, n, []);
}

export function evalSeries(s: Series, n: number): (x: number) => number {
  // TODO
  const coeffs = coeff(s, n);
  return (x: number): number => {
    let sum = 0;
    let xPow = 1;
    for (let i = 0; i < coeffs.length; i++) {
      sum += coeffs[i] * xPow;
      xPow *= x;
    }
    return sum;
  };
}

export function applySeries(f: (c: number) => number, v: number): Series {
  // TODO
  return snode(v, () => applySeries(f, f(v)));
}

export function expSeries(): Series {
  // TODO
  const getNextCoefficient = (() => {
    let currentFactorial = 1;
    let currentIndex = 0;
    return () => {
      currentIndex++;
      currentFactorial *= currentIndex;
      return 1 / currentFactorial;
    };
  })();

  return applySeries(getNextCoefficient, 1);
}

function calculateNextValue(init: number[], coef: number[]): number {
  let sum = 0;
  for (let i = 0; i < init.length; i++) {
    sum += init[i] * coef[i];
  }
  return sum;
}

function getNextValues(init: number[], coef: number[]): number[] {
  const nextValue = calculateNextValue(init, coef);
  return init.slice(1).concat(nextValue);
}

function generateRecurSeries(init: number[], coef: number[]): Stream<number> {
  return snode(init[0], () => generateRecurSeries(getNextValues(init, coef), coef));
}

export function recurSeries(coef: number[], init: number[]): Series {
  // TODO
  if (coef.length !== init.length) {
    throw new Error("The coef and init arrays must have the same length");
  }
  return generateRecurSeries(init, coef);
}

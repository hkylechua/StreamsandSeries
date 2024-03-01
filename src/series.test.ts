import { Stream, to, sempty } from "../include/stream.js";
import {
  addSeries,
  applySeries,
  coeff,
  derivSeries,
  evalSeries,
  expSeries,
  prodSeries,
  recurSeries,
} from "./series.js";

function expectStreamToBe<T>(s: Stream<T>, a: T[]) {
  for (const element of a) {
    expect(s.isEmpty()).toBe(false);
    expect(s.head()).toBe(element);

    s = s.tail();
  }

  expect(s.isEmpty()).toBe(true);
}

describe("addSeries", () => {
  it("adds simple streams together", () => {
    // Open `include/stream.ts` to learn how to use `to`
    // 1 -> 2 -> 3 -> 4 -> 5
    const a = to(1, 5);
    const b = to(1, 5);
    const c = addSeries(a, b);

    expectStreamToBe(c, [2, 4, 6, 8, 10]);
  });
});

describe("prodSeries", () => {
  // More tests for prodSeries go here
  it("multiplies the polynomials together properly", () => {
    const a = to(1, 2);
    const b = to(1, 2);
    const c = prodSeries(a, b);
    expectStreamToBe(c, [1, 4, 4]);
  });
});

describe("derivSeries", () => {
  it("computes the derivative of a simple series", () => {
    // s(x) = 1 + 2x + 3x^2
    const s = to(1, 3);
    const d = derivSeries(s);

    expectStreamToBe(d, [2, 6]);
  });
});

describe("coeff", () => {
  it("extracts the coefficients properly", () => {
    const a = to(1, 5);
    const b = coeff(a, 3);
    expect(b).toEqual([1, 2, 3, 4]);
  });

  it("returns an empty array when n is negative", () => {
    const a = to(1, 5);
    const b = coeff(a, -1);
    expect(b).toEqual([]);
  });

  it("returns an array of coefficients when n is greater than the series length", () => {
    const a = to(1, 5);
    const b = coeff(a, 10);
    expect(b).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns an empty array when the series is empty", () => {
    const a: Stream<number> = sempty();
    const b = coeff(a, 3);
    expect(b).toEqual([]);
  });
});

describe("evalSeries", () => {
  it("evaluates the series at a given point", () => {
    const s = to(1, 3);
    const evaluate = evalSeries(s, 2);
    expect(evaluate(0)).toBe(1);
    expect(evaluate(1)).toBe(6);
    expect(evaluate(2)).toBe(17);
  });

  it("evaluates an empty series as zero", () => {
    const s: Stream<number> = sempty();
    const evaluate = evalSeries(s, 2);
    expect(evaluate(0)).toBe(0);
    expect(evaluate(1)).toBe(0);
    expect(evaluate(2)).toBe(0);
  });

  it("evaluates the series with a larger n than the series length", () => {
    const s = to(1, 3);
    const evaluate = evalSeries(s, 5);
    expect(evaluate(0)).toBe(1);
    expect(evaluate(1)).toBe(6);
    expect(evaluate(2)).toBe(17);
  });

  it("evaluates the series with a negative n as zero", () => {
    const s = to(1, 3);
    const evaluate = evalSeries(s, -1);
    expect(evaluate(0)).toBe(0);
    expect(evaluate(1)).toBe(0);
    expect(evaluate(2)).toBe(0);
  });
});

describe("applySeries", () => {
  it("returns a result", () => {
    const f = (x: number) => x ** 2;
    const result = applySeries(f, 2);
    expect(result.isEmpty()).toBe(false);
  });
});

describe("expSeries", () => {
  it("computes the first few coefficients of the exponential series correctly", () => {
    const s = expSeries();
    const coefficients = coeff(s, 2);
    expect(coefficients).toEqual([1, 1, 1 / 2]);
  });

  it("computes the first five coefficients correctly", () => {
    const s = expSeries();
    const coefficients = coeff(s, 4);
    expect(coefficients).toEqual([1, 1, 0.5, 1 / 6, 1 / 24]);
  });

  it("computes the first ten coefficients of the exponential series correctly", () => {
    const s = expSeries();
    const coefficients = coeff(s, 9); // get the first ten coefficients
    expect(coefficients).toEqual([1, 1, 0.5, 1 / 6, 1 / 24, 1 / 120, 1 / 720, 1 / 5040, 1 / 40320, 1 / 362880]);
  });

  it("computes the exponential series at a given point", () => {
    const s = expSeries();
    const evaluate = evalSeries(s, 5);
    const tolerance = 1e-5;
    expect(Math.floor(evaluate(0) - Math.exp(0))).toBeLessThan(tolerance);
    expect(Math.floor(evaluate(1) - Math.exp(1))).toBeLessThan(tolerance);
    expect(Math.floor(evaluate(2) - Math.exp(2))).toBeLessThan(tolerance);
  });

  it("returns a series that starts with 1", () => {
    const s = expSeries();
    expect(s.head()).toBe(1);
  });

  it("returns a non-empty series", () => {
    const s = expSeries();
    expect(s.isEmpty()).toBe(false);
  });
});

describe("recurSeries", () => {
  it("throws an error with invalid input", () => {
    const coef = [1, 2];
    const init = [0, 1, 2];
    expect(() => recurSeries(coef, init)).toThrow("The coef and init arrays must have the same length");
  });

  it("returns a series with the correct initial values", () => {
    const coef = [1, 2];
    const init = [0, 1];
    const s = recurSeries(coef, init);
    expect(s.head()).toBe(0);
    expect(s.tail().head()).toBe(1);
  });

  it("computes the next value based on the coefficients and initial values", () => {
    const coef = [1, 2];
    const init = [0, 1];
    const s = recurSeries(coef, init);
    expect(s.tail().tail().head()).toBe(2); // 2 = 1*1 + 2*0
  });
});

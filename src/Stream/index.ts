import * as Ordering from "../Ordering.js";

export type GetToken<S extends Stream<any, any>> = S extends Stream<
  infer A,
  any
>
  ? A
  : never;

export type GetChunk<S extends Stream<any, any>> = S extends Stream<
  any,
  infer A
>
  ? A
  : never;

/**
 * 1. We need to know if we are at the end of the stream
 * 2. To support chomping we need to get a slice between two indexes
 * 3. Copy megaparsecs definition of a stream
 *
 * NOTE: I'm 100% confident we need to sprinkle some promises for this to work.
 */
export type Stream<
  TOKEN extends Ordering.IComparable,
  CHUNK extends Ordering.IComparable
> = {
  // The offset we are at
  // offset: number;
  tokenToChunk: (token: TOKEN) => CHUNK;
  tokensToChunk: (tokens: TOKEN[]) => CHUNK;
  chunkToTokens: (chunk: CHUNK) => TOKEN[];
  chunkLength: (chunk: CHUNK) => number;
  chunkEmpty: (chunk: CHUNK) => boolean; // Should have a default impl

  /**
   * Extract a singel token from the stream. Return undefined if the
   * stream is empty.
   */
  take1: (s: CHUNK) => [TOKEN, CHUNK] | undefined;

  /**
   * Extract a chunk from the stream.
   */
  takeN: (n: number) => (s: CHUNK) => [CHUNK, CHUNK] | undefined;

  /**
   * Take tokens from a stream while the provided predicate returns `true`
   */
  takeWhile: (
    predicate: (token: TOKEN) => boolean
  ) => (s: CHUNK) => [CHUNK, CHUNK];
};

export abstract class BaseStream<
  TOKEN extends Ordering.IComparable,
  CHUNK extends Ordering.IComparable
> implements Stream<TOKEN, CHUNK>
{
  // Stream manipulation
  abstract tokensToChunk(tokens: TOKEN[]): CHUNK;
  abstract chunkToTokens(chunk: CHUNK): TOKEN[];
  abstract chunkLength(chunk: CHUNK): number;

  abstract take1(s: CHUNK): [TOKEN, CHUNK] | undefined;

  abstract takeN(n: number): (s: CHUNK) => [CHUNK, CHUNK] | undefined;

  abstract takeWhile(
    predicate: (token: TOKEN) => boolean
  ): (s: CHUNK) => [CHUNK, CHUNK];

  // Default implementations
  chunkEmpty(chunk: CHUNK) {
    return this.chunkLength(chunk) === 0;
  }

  tokenToChunk(token: TOKEN) {
    return this.tokensToChunk([token]);
  }
}

class ComparableArray<A extends Ordering.IComparable>
  extends Array<A>
  implements Ordering.IComparable
{
  compareTo(other: ComparableArray<A>) {
    return Ordering.compareArrays(this, other);
  }

  equals(other: ComparableArray<A>) {
    return this.compareTo(other) === Ordering.Ordering.EQ;
  }

  lessThan(other: ComparableArray<A>) {
    return this.compareTo(other) === Ordering.Ordering.LT;
  }

  greaterThan(other: ComparableArray<A>) {
    return this.compareTo(other) === Ordering.Ordering.GT;
  }

  static fromArray<A extends Ordering.IComparable>(
    arr: A[]
  ): ComparableArray<A> {
    const array = new ComparableArray<A>(arr.length);
    array.push(...arr);
    return array;
  }
}

/**
 * Lots of unnecessary copying here. We should try to avoid that.
 * I also don't like that we have to extend array to be an IComparable.
 *
 * This means you can't have an array like [1,2,3,4] Because it will be
 * the numbers can't be extended to be IComparable. It would be better to inject
 * compare functions into the stream directly.
 *
 * Steam is more a collection of functions on a type than a type itself.
 * How would we we implement stream for a lazy reading from a file?
 */
export class ArrayStream<A extends Ordering.IComparable> extends BaseStream<
  A,
  ComparableArray<A>
> {
  tokensToChunk(tokens: A[]) {
    return ComparableArray.fromArray(tokens);
  }

  chunkToTokens(chunk: ComparableArray<A>) {
    return chunk;
  }

  chunkLength(chunk: ComparableArray<A>) {
    return chunk.length;
  }
  take1(s: ComparableArray<A>): [A, ComparableArray<A>] | undefined {
    if (s.length === 0) {
      return undefined;
    } else {
      return [s[0], ComparableArray.fromArray(s.slice(1))];
    }
  }

  takeN(
    n: number
  ): (
    s: ComparableArray<A>
  ) => [ComparableArray<A>, ComparableArray<A>] | undefined {
    return (s: ComparableArray<A>) => {
      if (n <= 0) {
        return [new ComparableArray<A>(0), s];
      }
      if (s.length === 0) {
        return undefined;
      } else {
        return [
          ComparableArray.fromArray(s.slice(0, n)),
          ComparableArray.fromArray(s.slice(n)),
        ];
      }
    };
  }

  takeWhile(
    predicate: (token: A) => boolean
  ): (s: ComparableArray<A>) => [ComparableArray<A>, ComparableArray<A>] {
    return (s: ComparableArray<A>) => {
      const len = s.length;
      let i = 0;
      while (i < len && predicate(s[i])) {
        i++;
      }
      return [
        ComparableArray.fromArray(s.slice(0, i)),
        ComparableArray.fromArray(s.slice(i)),
      ];
    };
  }
}

// import * as fs from "fs";
// const stream = fs.createReadStream("file.txt");
// stream.on("data", (chunk) => {
//   console.log(chunk);
// });

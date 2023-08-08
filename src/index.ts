/**
 * If you are new to this library, please take a look at {@link Simple:namespace | simple module}.
 * It is a simple wrapper around the {@link Advanced:namespace | advanced module} that hides some of the
 * complexity. You do not have to worry about having to rewrite any of your code. They are both fully compatible.
 *
 * @remarks
 * I created this library because I wanted a type-safe parser combinator library
 * like Haskell's {@link https://hackage.haskell.org/package/parsec parsec}
 * or Elm's {@link https://package.elm-lang.org/packages/elm/parser/ parser library}.
 *
 * @see {@link https://en.wikipedia.org/wiki/Parser_combinator Parser Combinator}
 *
 * @packageDocumentation
 */

/**
 * The Helper module contains utility functions that are used in both the {@link Advanced:namespace | Advanced}
 * and {@link Simple:namespace | Simple} modules.
 *
 * Feel free to use them when you are writing your own parsers :)
 */
export * as Helpers from "./StringHelpers.js";

/**
 * The {@link Result:namespace | Result} defines a simple `Result` type for
 * representing success and error.
 */
export * as Result from "./Result.js";

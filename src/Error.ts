import * as Ordering from "./Ordering.js";

////////////////////////////////////////////////////////////////////////////////
// ErrorItem
////////////////////////////////////////////////////////////////////////////////

// Needs Eq, Ord, toString, map...
export type ErrorItem<T> = Tokens<T> | Label | EndOfInput;

export class Tokens<T> {
  constructor(public tokens: T[]) {}

  isTokens(): this is Tokens<T> {
    return true;
  }

  isLabel(): this is Label {
    return false;
  }

  isEndOfInput(): this is EndOfInput {
    return false;
  }
}

export class Label {
  constructor(public label: string) {}

  isTokens(): this is Tokens<never> {
    return false;
  }

  isLabel(): this is Label {
    return true;
  }

  isEndOfInput(): this is EndOfInput {
    return false;
  }
}

export class EndOfInput {
  isTokens(): this is Tokens<never> {
    return false;
  }

  isLabel(): this is Label {
    return false;
  }

  isEndOfInput(): this is EndOfInput {
    return true;
  }
}

////////////////////////////////////////////////////////////////////////////////
// ErrorFancy
////////////////////////////////////////////////////////////////////////////////

// Needs Eq, Ord, toString, map...

/**
 * Additional error data, extendable by user. When no custom data is
 * necessary, the type is typically indexed by 'never' to “cancel” the
 * 'ErrorCustom' constructor.
 */
export type ErrorFancy<E> = ErrorFail | ErrorIndentation | ErrorCustom<E>;

/**
 * 'fail' has been used in parser monad
 */
export class ErrorFail {
  constructor(public message: string) {}

  isFail(): this is ErrorFail {
    return true;
  }

  isIndentation(): this is ErrorIndentation {
    return false;
  }

  isCustom(): this is ErrorCustom<never> {
    return false;
  }
}

/**
 * Incorrect indentation error: desired ordering between reference
 * level and actual level, reference indentation level, actual
 * indentation level.
 */
class ErrorIndentation {
  constructor(
    public order: Ordering.Ordering,
    public level: number,
    public desiredLevel: number
  ) {}

  isFail(): this is ErrorFail {
    return false;
  }

  isIndentation(): this is ErrorIndentation {
    return true;
  }

  isCustom(): this is ErrorCustom<never> {
    return false;
  }
}

/**
 * Custom error data type.
 */
export class ErrorCustom<E> {
  constructor(public error: E) {}

  isFail(): this is ErrorFail {
    return false;
  }

  isIndentation(): this is ErrorIndentation {
    return false;
  }

  isCustom(): this is ErrorCustom<E> {
    return true;
  }
}

////////////////////////////////////////////////////////////////////////////////
// ParseError
////////////////////////////////////////////////////////////////////////////////

// Needs Eq, Ord, toString, map...

/**
 * @'ParseError' s e@ represents a parse error parametrized over the
 * stream type @s@ and the custom data @e@.
 *
 * 'Semigroup' and 'Monoid' instances of the data type allow us to merge
 * parse errors from different branches of parsing. When merging two
 * 'ParseError's, the longest match is preferred; if positions are the same,
 * custom data sets and collections of message items are combined. Note that
 * fancy errors take precedence over trivial errors in merging.
 */
export type ParseError<TOKEN, ERROR> = TrivialError<TOKEN> | FancyError<ERROR>;

/**
 * Trivial errors, generated by the MegaKombo's machinery. The data
 * constructor includes the offset of error, unexpected token (if any),
 * and expected tokens.
 */
export class TrivialError<TOKEN> {
  constructor(
    public offset: number,
    public unexpected: ErrorItem<TOKEN> | undefined,
    public expected: ErrorItem<TOKEN>[] // Should be a Set...
  ) {}

  isTrivial(): this is TrivialError<TOKEN> {
    return true;
  }

  isFancy(): this is FancyError<never> {
    return false;
  }
}

/**
 * Fancy, custom errors.
 */
export class FancyError<ERROR> {
  constructor(
    public offset: number,
    public errors: ErrorFancy<ERROR>[] // Should be a Set...
  ) {}

  isTrivial(): this is TrivialError<never> {
    return false;
  }

  isFancy(): this is FancyError<ERROR> {
    return true;
  }
}
import { ParseError } from "./Error.js";

export type State<STREAM, ERROR> = {
  // The rest of the input to process
  srcInput: STREAM;
  // Number of processed tokens so far
  srcOffset: number;
  // State that is used for line/column calculation
  srcPosition: Position<STREAM>;
  // Collection of "delayed" Errors in reverse order. This means
  // that the first error is the last one that happened.
  srcErrors: ParseError<STREAM, ERROR>[];
};

// https://github.com/mrkkrp/megaparsec/blob/master/Text/Megaparsec/Pos.hs

export type Position<SRC> = {
  // The rest of the input to process
  src: SRC;
  // Offset corresponding to beginning of 'src'
  srcOffset: number;
  // Source position corresponding to beginning of 'src'
  srcPosition: SourcePosition;
  // Tab width to use for column calculation
  tabWidth: number;
  // Prefix to prepend to offending line
  linePrefix: string;
};

/**
 * The data type 'SourcePosition' represents source positions. It contains the
 * name of the source file, a line number, and a column number.
 */
export type SourcePosition = {
  // Name of the source file
  name: string;
  // Line number, starting from 1
  line: number;
  // Column number, starting from 1
  column: number;
};

/**
 * A piece table is an efficient data structure to track changes to text.
 * See <https://www.cs.unm.edu/~crowley/papers/sds/node15.html> for details
 * https://github.com/sparkeditor/piece-table/blob/master/index.js
 */
export function PieceTable2<T>(fileText: T[]) {
  /**
   * The file buffer represents the original file text
   * @private
   * @type {string}
   */
  const file = fileText || [];

  /**
   * The add buffer represents text that has been added to the original file
   * @private
   * @type {string}
   */
  let add: T[] = [];

  /**
   * A Piece describes a window into the file or the add buffer
   * @typedef {Object} Piece
   * @property {boolean} addBuffer - true if the Piece points to the add buffer, false if it points to the file buffer
   * @property {number} offset - the index in the buffer where the Piece starts
   * @property {number} length - the length of the Piece
   * @private
   */

  /**
   * The piece table describes the sequence as a series of Pieces
   * @type {Piece[]}
   * @private
   */
  const pieceTable = [{
    addBuffer: false,
    offset: 0,
    length: file.length
  }];

  /**
   * An error thrown when an attempt is made to access the sequence at an invalid index
   * @private
   * @type {Error}
   */
  const outOfBoundsError = new Error("Index out of bounds");

  /**
   * Returns the index in the piece table of the piece that contains the character at offset, and the offset into that piece's buffer corresponding to the offset
   * @private
   * @param offset - an index into the sequence (not into the piece table)
   * @returns {number[]} A 2-number array where the first number is the piece table index, and the second is the offset into that piece's buffer
   */
  function sequenceOffsetToPieceIndexAndBufferOffset(offset: number) {
    if (offset < 0) {
      throw outOfBoundsError;
    }
    let remainingOffset = offset;
    for (let i = 0; i < pieceTable.length; i++) {
      let piece = pieceTable[i];
      if (remainingOffset <= piece.length) {
        return [i, piece.offset + remainingOffset];
      }
      remainingOffset -= piece.length;
    }
    // If this is reached, the offset is greater than the sequence length
    throw outOfBoundsError;
  };

  /**
   * Inserts a string into the piece table
   * @param {string} str - the string to insert
   * @param {number} offset - the offset at which to insert the string
   */
  this.insert = function(str: T[], offset: number) {
    if (str.length === 0) {
      return;
    }
    const addBufferOffset = add.length;
    add = add.concat(str)
    const [pieceIndex, bufferOffset] = sequenceOffsetToPieceIndexAndBufferOffset(offset);
    let originalPiece = pieceTable[pieceIndex];
    // If the piece points to the end of the add buffer, and we are inserting at its end, simply increase its length
    if (originalPiece.addBuffer && bufferOffset === originalPiece.offset + originalPiece.length && originalPiece.offset + originalPiece.length === addBufferOffset) {
      originalPiece.length += str.length;
      return;
    }
    const insertPieces = [
      {
        addBuffer: originalPiece.addBuffer,
        offset: originalPiece.offset,
        length: bufferOffset - originalPiece.offset
      },
      {
        addBuffer: true,
        offset: addBufferOffset,
        length: str.length
      },
      {
        addBuffer: originalPiece.addBuffer,
        offset: bufferOffset,
        length: originalPiece.length - (bufferOffset - originalPiece.offset)
      }].filter(function(piece) {
      return piece.length > 0;
    });
    pieceTable.splice(pieceIndex, 1, ...insertPieces);
  };

  /**
   * Deletes a string from the piece table
   * @param {number} offset - the offset at which to begin deletion
   * @param {number} length - the number of characters to delete. If negative, deletes backwards
   */
  this.delete = function(offset: number, length: number) {
    if (length === 0) {
      return;
    }
    if (length < 0) {
      return this.delete(offset + length, -length);
    }
    if (offset < 0) {
      throw outOfBoundsError;
    }

    // First, find the affected pieces, since a delete can span multiple pieces
    let [initialAffectedPieceIndex, initialBufferOffset] = sequenceOffsetToPieceIndexAndBufferOffset(offset);
    let [finalAffectedPieceIndex, finalBufferOffset] = sequenceOffsetToPieceIndexAndBufferOffset(offset + length);

    // If the delete occurs at the end or the beginning of a single piece, simply adjust the window
    if (initialAffectedPieceIndex === finalAffectedPieceIndex) {
      let piece = pieceTable[initialAffectedPieceIndex];
      // Is the delete at the beginning of the piece?
      if (initialBufferOffset === piece.offset) {
        piece.offset += length;
        piece.length -= length;
        return;
      }
      // Or at the end of the piece?
      else if (finalBufferOffset === piece.offset + piece.length) {
        piece.length -= length;
        return;
      }
    }

    const deletePieces = [
      {
        addBuffer: pieceTable[initialAffectedPieceIndex].addBuffer,
        offset: pieceTable[initialAffectedPieceIndex].offset,
        length: initialBufferOffset - pieceTable[initialAffectedPieceIndex].offset
      },
      {
        addBuffer: pieceTable[finalAffectedPieceIndex].addBuffer,
        offset: finalBufferOffset,
        length: pieceTable[finalAffectedPieceIndex].length - (finalBufferOffset - pieceTable[finalAffectedPieceIndex].offset)
      }].filter(function(piece) {
      return piece.length > 0;
    });

    pieceTable.splice(initialAffectedPieceIndex, finalAffectedPieceIndex - initialAffectedPieceIndex + 1, ...deletePieces);
  };

  /**
   * Gets the sequence as a string
   * @returns {string} The sequence
   */
  this.getSequence = function() {
    let str: T[][] = [];
    pieceTable.forEach(function(piece) {
      if (piece.addBuffer) {
        str.push(slice(add,piece.offset, piece.length))
        //str += add.substr(piece.offset, piece.length);
      }
      else {
        str.push(slice(file,piece.offset, piece.length))
        //str += file.substr(piece.offset, piece.length);
      }
    });
    return Array.prototype.concat(...str);
  };
 function slice(arr: T[],offset:number,len:number): T[] {
   const ret = arr.slice(offset,offset+len)
   return ret
 }
  /**
   * PieceTable iterator
   * @private
   */
  this[Symbol.iterator] = function() {
    let currentPiece = 0;
    let currentOffset = 0;
    return {
      next: function() {
        if (currentOffset > pieceTable[currentPiece].length - 1) {
          currentPiece++;
          currentOffset = 0;
        }
        if (currentPiece > pieceTable.length - 1) {
          return {done: true};
        }
        else {
          const piece = pieceTable[currentPiece];
          let val;
          if (piece.addBuffer) {
            val = slice(add,piece.offset + currentOffset, 1)
            //val = add.substr(piece.offset + currentOffset, 1);
          }
          else {
            val = slice(file,piece.offset + currentOffset, 1);
            //val = file.substr(piece.offset + currentOffset, 1);
          }
          currentOffset++;
          return {value: val[0], done: false};
        }
      }
    };
  };

  /**
   * Gets a string of a particular length from the piece table at a particular offset
   * @param {number} offset - the offset from which to get the string
   * @param {number} length - the number of characters to return from the offset. If negative, looks backwards
   */
  this.stringAt = function(offset: number, length: number) {
    if (length < 0) {
      return this.stringAt(offset + length, -length);
    }
    let str: T[][] = [];
    const [initialPieceIndex, initialBufferOffset] = sequenceOffsetToPieceIndexAndBufferOffset(offset);
    const [finalPieceIndex, finalBufferOffset] = sequenceOffsetToPieceIndexAndBufferOffset(offset + length);
    let piece = pieceTable[initialPieceIndex];
    let buf = piece.addBuffer ? add : file;
    let remainingPieceLength = initialBufferOffset - piece.offset;
    if (length < piece.length - (remainingPieceLength)) {
      str[0] = slice(buf,initialBufferOffset, length)
      //str = buf.substr(initialBufferOffset, length);
    }
    else {
      str.push(slice(buf,initialBufferOffset, remainingPieceLength))
      //str += buf.substr(initialBufferOffset, remainingPieceLength);
      // Iterate through remaining pieces
      for (let i = initialPieceIndex; i <= finalPieceIndex; i++) {
        piece = pieceTable[i];
        buf = piece.addBuffer ? add : file;
        // If this is the final piece, only add the remaining length to the string
        if (i === finalPieceIndex) {
          str.push(slice(buf,piece.offset, finalBufferOffset - piece.offset))
          //str += buf.substr(piece.offset, finalBufferOffset - piece.offset);
        }
        // Otherwise, add the whole piece to the string
        else {
          str.push(slice(buf,piece.offset, piece.length))
          //str += buf.substr(piece.offset, piece.length);
        }
      }
    }
    return str.length === 0 ? undefined : Array.prototype.concat(...str)
    //return str === "" ? undefined : str;
  };
};

export function pieceTableExample() {
  const txt = "a".split('')
  const pt = new PieceTable2(txt);

  pt.insert("b".split(''), 1);
  pt.insert("c".split(''), 2);

// Delete the previously inserted sentence
  pt.delete(1, 1);

  var sequence = pt.getSequence();
// sequence == "This is a document with some text."

  var subString = pt.stringAt(0, 1);
// subString == "document"

// PieceTable is an iterable:
  for (let character of pt) {
    console.log(character);
    // 'T', 'h', 'i', 's', ...
  }
}
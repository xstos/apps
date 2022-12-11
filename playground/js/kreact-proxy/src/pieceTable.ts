/**
 * A piece table is an efficient data structure to track changes to text.
 * See <https://www.cs.unm.edu/~crowley/papers/sds/node15.html> for details
 * https://github.com/sparkeditor/piece-table/blob/master/index.js
 * https://darrenburns.net/posts/piece-table/
 */
import Immutable from "immutable"

let log = console.log
const outOfBoundsError = new Error("Index out of bounds");
export function PieceTable<T>(fileContents: T[]) {
  /**
   * The file buffer represents the original file text
   * @private
   * @type {string}
   */
  const file = fileContents || [];

  /**
   * The add buffer represents text that has been added to the original file
   * @private
   * @type {string}
   */
  let add: T[] = [];
  const firstPiece = {
    addBuffer: false, //true if the Piece points to the add buffer, false if it points to the file buffer
    offset: 0, //the index in the buffer where the Piece starts
    length: file.length //the length of the Piece
  }
  let pieceTable = [firstPiece];

  let history = Immutable.fromJS([[firstPiece]])
   //Returns the index in the piece table of the piece that contains the character at offset, and the offset into that piece's buffer corresponding to the offset
  function sequenceOffsetToPieceIndexAndBufferOffset(offset: number): [number,number] {
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

  function pushHistory() {
    let prev = history.last()
    for (let i = 0; i < pieceTable.length; i++){
      const piece = pieceTable[i]
      let p = prev.get(i)
      if (!p) {
        prev = prev.set(i,Immutable.Map(piece))
      } else {
        prev = prev.set(i,p.merge(piece))
      }
    }

    history=history.push(prev)
    const h =getHistory(history.size-1)
    log(h)
  }
  function getHistoryLastIndex() {
    return history.size-1
  }
  function getHistory(index: number): T[] {
    const old = pieceTable
    pieceTable = history.get(index).map(h=>h.toJS())
    const doc = getSequence()
    pieceTable=old
    return doc
  }
  function getHistories() {
    return history.map((h,i)=>getHistory(i))
  }
  function insert(str: T[], offset?: number) {
    if (str.length === 0) {
      return;
    }
    offset = offset === undefined ? add.length : offset
    const addBufferOffset = add.length;
    add = add.concat(str)

    const newPiece = {
      addBuffer: true,
      offset: addBufferOffset,
      length: str.length
    }

    const [pieceIndex, bufferOffset] = sequenceOffsetToPieceIndexAndBufferOffset(offset);
    let originalPiece = pieceTable[pieceIndex];
    // If the piece points to the end of the add buffer, and we are inserting at its end, simply increase its length
    if (originalPiece.addBuffer && bufferOffset === originalPiece.offset + originalPiece.length && originalPiece.offset + originalPiece.length === addBufferOffset) {
      originalPiece.length += str.length;
      pushHistory()
      return;
    }

    const insertPieces = [
      {
        addBuffer: originalPiece.addBuffer,
        offset: originalPiece.offset,
        length: bufferOffset - originalPiece.offset
      },
      newPiece,
      {
        addBuffer: originalPiece.addBuffer,
        offset: bufferOffset,
        length: originalPiece.length - (bufferOffset - originalPiece.offset)
      }].filter(function(piece) {
      return piece.length > 0;
    });
    pieceTable.splice(pieceIndex, 1, ...insertPieces);

    pushHistory()
    //log(pieceTable,'ins',str,offset)
  };
  function remove(offset: number, length: number) {
    if (length === 0) {
      return;
    }
    if (length < 0) {
      remove(offset + length, -length);
      return
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
        pushHistory()
        return;
      }
      // Or at the end of the piece?
      else if (finalBufferOffset === piece.offset + piece.length) {
        piece.length -= length;
        pushHistory()
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
    pushHistory()
    //log(pieceTable,'del',offset, length)
  };
  function getSequence() {
    let str: T[][] = [];
    pieceTable.forEach(function(piece) {
      let chunk = piece.addBuffer ? add : file
      str.push(slice(chunk,piece.offset, piece.length))
    });
    return Array.prototype.concat(...str);
  };
  function iter() {
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
  function stringAt(offset: number, length: number): T[] {
    if (length < 0) {
      return stringAt(offset + length, -length);
    }
    let str: T[][] = [];
    const [initialPieceIndex, initialBufferOffset] = sequenceOffsetToPieceIndexAndBufferOffset(offset);
    const [finalPieceIndex, finalBufferOffset] = sequenceOffsetToPieceIndexAndBufferOffset(offset + length);
    let piece = pieceTable[initialPieceIndex];
    let buf = piece.addBuffer ? add : file;
    let remainingPieceLength = initialBufferOffset - piece.offset;
    if (length < piece.length - (remainingPieceLength)) {
      str[0] = slice(buf,initialBufferOffset, length)
    }
    else {
      str.push(slice(buf,initialBufferOffset, remainingPieceLength))
      // Iterate through remaining pieces
      for (let i = initialPieceIndex; i <= finalPieceIndex; i++) {
        piece = pieceTable[i];
        buf = piece.addBuffer ? add : file;
        // If this is the final piece, only add the remaining length to the string
        if (i === finalPieceIndex) {
          str.push(slice(buf,piece.offset, finalBufferOffset - piece.offset))
        }
        // Otherwise, add the whole piece to the string
        else {
          str.push(slice(buf,piece.offset, piece.length))
        }
      }
    }
    return str.length === 0 ? [] : Array.prototype.concat(...str)
  };
  return {
    insert,
    remove,
    getSequence,
    stringAt,
    getHistories,
    [Symbol.iterator]: iter,
  }
};
function slice<T>(arr: T[],offset:number,len:number): T[] {
  const ret = arr.slice(offset,offset+len)
  return ret
}
export function pieceTableExample() {
  const txt = "a".split('')

  const pt = PieceTable([..."a"]);

  pt.insert([..."b"], 1);
  pt.insert([..."c"], 2);

  pt.remove(1, 1);
  let huge = new Array(10000).fill(0)
    .flatMap((v,i)=>(i+' ').split(''))

  pt.insert(huge,1)
  //pt.getHistories().map(log)
  return
  var sequence = pt.getSequence();

  var subString = pt.stringAt(0, 1);

// PieceTable is an iterable:
  for (let character of pt) {
    console.log(character);
    // 'T', 'h', 'i', 's', ...
  }
}
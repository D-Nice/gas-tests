pragma solidity ^0.4.24;

contract GasABI {

  event LogBytes(bytes a, bytes b);

  // assumes first array element is single word
  function singleArray(bytes a) public {
    bytes memory b;
    bytes memory c;
    assembly {
      b := add(a, 0x60)
      c := add(a, add(mload(add(a, 0x40)), 0x20))
    }
    emit LogBytes(b, c);
  }

  // assumes 2 element array both 2 word sizes
  // note a proper implementation would need to be flexible,
  // unlike this one, and therefore would be much less efficient
  function singleArray2(bytes a) public {
    bytes memory b;
    bytes memory c;
    assembly {
      b := add(a, 0x60)
      c := add(b, 0x60)
    }
    emit LogBytes(b, c);
  }



  function doubleArray(bytes b, bytes c) public {
    emit LogBytes(b, c);
  }

  function emptySingle(bytes a) public {}

  function emptyParseSingle(bytes a) public {
    bytes memory b;
    bytes memory c;
    assembly {
      b := add(a, 0x60)
      c := add(b, 0x60)
    }
  }


  function emptyDouble(bytes a, bytes b) public {}

}

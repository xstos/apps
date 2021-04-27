function x(items, left, right) {
  const pivot = items[Math.floor((right + left) / 2)]; //middle element

  let i = left; //left pointer

  let j = right; //right pointer

  while (i <= j) {
    while (items[i] < pivot) {
      i++;
    }

    while (items[j] > pivot) {
      j--;
    }

    if (i <= j) {
      const temp = items[i];
      items[i] = items[j];
      items[j] = temp; //swapping two elements

      i++;
      j--;
    }
  }

  return i;
}

function x(items, left, right) {
  let index;

  if (items.length > 1) {
    index = partition(items, left, right); //index returned from partition

    if (left < index - 1) {
      //more elements on the left side of the pivot
      quickSort(items, left, index - 1);
    }

    if (index < right) {
      //more elements on the right side of the pivot
      quickSort(items, index, right);
    }
  }

  return items;
}

const items = [];
const sortedArray = quickSort(items, 0, items.length - 1);
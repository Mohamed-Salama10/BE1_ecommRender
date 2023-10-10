export const paginationFunction = ({ page = 1, size = 2 }) => {
  if (page < 1) {
    page = 1;
    size = 2;
  }

  // define the limit of the returned data per page , it is equal to the size
  const limit = size;

  // skip how many chucnks of data from the db to get the data related to the current page

  const skip = (page - 1) * size;

  return { limit, skip };
};

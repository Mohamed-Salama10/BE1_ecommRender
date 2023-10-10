// Import the 'paginationFunction' from the 'pagination.js' module
import { paginationFunction } from "./pagination.js";

// Define a class called 'ApiFeatures'
export class ApiFeatures {
  // Constructor function that takes 'mongooseQuery' and 'queryData' as parameters
  constructor(mongooseQuery, queryData) {
    // Initialize class properties with the provided parameters
    this.mongooseQuery = mongooseQuery;
    this.queryData = queryData;
  }

  // Define a method called 'pagination'
  paginattion() {
    // Destructure 'page' and 'size' properties from 'queryData'
    const { page, size } = this.queryData;
    // Use the 'paginationFunction' to calculate 'limit' and 'skip' based on 'page' and 'size'
    const { limit, skip } = paginationFunction(page, size);
    // Apply 'limit' and 'skip' to the 'mongooseQuery'
    this.mongooseQuery.limit(limit).skip(skip);
    // Return the 'ApiFeatures' instance to allow method chaining
    return this;
  }

  // Define a method called 'sort'
  sort() {
    // Replace any commas in the 'sort' property of 'queryData' with spaces and apply sorting to 'mongooseQuery'
    this.mongooseQuery.sort(this.queryData.sort?.replace(",", " "));
    // Return the 'ApiFeatures' instance to allow method chaining
    return this;
  }

  // Define a method called 'search'
  search() {
    // Replace any commas in the 'search' property of 'queryData' with spaces, but it seems to be missing a line to apply this to 'mongooseQuery'
    this.mongooseQuery.search(this.queryData.search?.replace(",", " "));
  }

  // Define a method called 'filter'
  filter() {
    // Create a copy of the 'req.query' object from 'this' instance
    const filterInstance = { ...this.req.query };
    // Define an array of property names to exclude
    const excludeArray = ["page", "size", "sort", "select", "search"];
    // Iterate over the 'excludeArray' and delete corresponding properties from 'filterInstance'
    excludeArray.forEach((key) => filterInstance.delete[key]);

    // Create a new 'filterString' by converting 'filterInstance' to a string and replacing certain strings with '$' to be sent to the database
    const filterString = JSON.parse(
      JSON.stringify(filterInstance).replace(
        /gt|gte|lt|lte|in|nin|eq|neq|regex/g,
        (match) => `$${match}`
      )
    );
    // Apply the 'filterString' to 'mongooseQuery' to filter the results
    this.mongooseQuery.find(filterString);
    // Return the 'ApiFeatures' instance to allow method chaining
    return this;
  }
}

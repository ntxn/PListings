import { Query } from 'mongoose';
import { ParsedQs } from 'qs';

/**
 * QueryFeatures class provide different options for MongoD Query Object
 * such as filtering (find), sorting, fields selection, and pagination
 *
 * The keys of the queryObj are the fields of the Mongoose Model.
 *
 * In a request URL, the query string starts after the question marks `?`
 * In a request Object (like Express Request), it will be a key-value pair object
 */
export class QueryFeatures {
  constructor(public query: Query<any[]>, public queryObj: ParsedQs) {}

  /**
   * Filtering the query based on the queryObj.
   *
   * Keywords like gte, gt, lte, lt can be used where it is appropreate
   * (For example: if the value of the field is a number, it makes sense
   * to compare if that value is greater than 5)
   *
   * Query Example:
   *
   * Query string: `duration[gte]=5&difficulty=easy&price[lt]=1500`
   *
   * Req Object: `{ duration: { gte: '5' }, difficulty: 'easy', price: { lt: '1500' } }`
   */
  filter(): QueryFeatures {
    const queryObj = { ...this.queryObj };

    // Filter out excluded fields from query string
    ['page', 'sort', 'limit', 'fields'].forEach(
      field => delete queryObj[field]
    );

    // insert dolar sign $ to keywords gte, gt, lte, lt to transform them into mongoDB keywords for querying with mongoDB
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      matchStr => `$${matchStr}`
    );

    // run filtering based on query string
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Sort the query based on the query string
   *
   * EXAMPLE
   *
   * Query string: `sort=price,ratingsAverage`
   *
   * Req Object: `{ sort: 'price,ratingsAverage' }`
   */
  sort(): QueryFeatures {
    if (this.queryObj.sort) {
      // @ts-ignore
      const sortBy = this.queryObj.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  /**
   * Only select the requested fields
   *
   * EXAMPLE:
   *
   * Query string: `fields=name,duration,difficulty,price` or `fields=-price,-ratings`
   *
   * Req Object: `{ fields: 'name,duration,difficulty,price' }` or `{ fields: '-price,-ratings' }`
   */
  selectFields(): QueryFeatures {
    if (this.queryObj.fields) {
      // @ts-ignore
      const fields = this.queryObj.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  /**
   * Returns results based requested page number and number of items per page
   *
   * EXAMPLE:
   *
   * Query String: `limit=5&page=3`
   *
   * Req Object: `{ limit: '5', page: '3' }`
   */
  paginate(): QueryFeatures {
    // @ts-ignore
    const pageNumber = parseInt(this.queryObj.page) || 1;
    // @ts-ignore
    const numItemsPerPage = parseInt(this.queryObj.limit) || 20;
    const numItemsToSkip = (pageNumber - 1) * numItemsPerPage;

    this.query = this.query.skip(numItemsToSkip).limit(numItemsPerPage);
    return this;
  }
}

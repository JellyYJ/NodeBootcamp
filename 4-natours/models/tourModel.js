const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

/** BEGIN WITH THE SIMPLE TOUR DATA */
// create a mongoose schema
// const tourSchema = new mongoose.Schema({
//   name: { type: String, required: [true, 'Missing tour name'], unique: true },
//   rating: { type: Number, default: 4.5 },
//   price: { type: Number, required: [true, 'Missing tour price'] },
// });

// // create a model out of the tourSchema
// const Tour = mongoose.model('Tour', tourSchema);
// module.exports = Tour;

/** GOING FOR THE COMPLEX TOUR DATA */
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a unique name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Missing tour price'],
    },
    priceDiscount: {
      type: Number,
      validate: function (val) {
        // this only points to current doc on NEW document creation
        return val < this.price; // show error if val > this.price
      },
      message: 'Discount price ({VALUE}) should be below regular price',
    },
    summary: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },

    startLocation: {
      // GeoJSON
      // we only want the geo loctaion be Point
      type: { type: String, defult: 'Point', enum: ['Point'] },
      coordinates: [Number], // accepting an array of numbers
      address: String,
      description: String,
      day: Number,
    },

    location: {
      type: { type: String, defult: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },

    // guides: Array, // embedded
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Property
// cannot use this virtual property in query
// also it is not a good practice to build this in the controller
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document Middleware: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  // console.log(this.slug);
  next(); // to call the next middleware in the stack
});

// Emdedded guides (NOT IN USE, since we are using reference)
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); // usage of async!
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secreTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`); // see how long it takes to run a query
  // console.log(docs);
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secreTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// create a model out of the tourSchema
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

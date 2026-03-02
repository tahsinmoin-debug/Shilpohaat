// Test script for review API
const mongoose = require('mongoose');
require('dotenv').config();

const Review = require('../models/Review');
const connectDB = require('../config/db');

async function testReviewCreation() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Test data
        const testReview = {
            artwork: '507f1f77bcf86cd799439011', // Replace with a real artwork ID from your database
            reviewerId: 'test-user-123',
            reviewerName: 'Test User',
            rating: 5,
            comment: 'This is a test review'
        };

        console.log('Creating review with data:', testReview);

        const newReview = await Review.create(testReview);
        console.log('Review created successfully:', newReview);

        // Clean up - delete the test review
        await Review.deleteOne({ _id: newReview._id });
        console.log('Test review deleted');

        process.exit(0);
    } catch (error) {
        console.error('Error during test:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.errors) {
            console.error('Validation errors:', error.errors);
        }
        process.exit(1);
    }
}

testReviewCreation();

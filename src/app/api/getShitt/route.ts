// src/app/api/getShitt/route.ts

import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import path from 'path';
import csv from 'csv-parser';
import OpenAI from 'openai';

// Initialize OpenAI configuration
const openai = new OpenAI({apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true});

// Define the type for a user row in the CSV
interface User {
  [key: string]: string;
  // Example fields; adjust according to your CSV structure
  'Country': string;
  'Field of Study': string;
  'Interests': string;
  'Impact': string;
  // Add other fields as needed
}

// Handler for GET requests
export async function GET(request: Request) {
  try {
    // Parse the URL to extract query parameters
    const { searchParams } = new URL(request.url);
    const criteria = searchParams.get('criteria') || 'Country'; // Default to 'Country'

    // Define the path to the CSV file
    const csvFilePath = path.join(process.cwd(), 'src/app/api/getShitt', 'grid.csv');

    // Create a read stream for the CSV file
    const stream = createReadStream(csvFilePath).pipe(csv());

    const users: User[] = [];

    // Listen for data events to parse each row
    for await (const row of stream) {
      users.push(row as User);
    }

    // Validate the criteria
    if (!users.length) {
      return NextResponse.json(
        { error: 'No users found in CSV.' },
        { status: 404 }
      );
    }

    if (!users[0].hasOwnProperty(criteria)) {
      return NextResponse.json(
        { error: `Invalid criteria "${criteria}". Available criteria: ${Object.keys(users[0]).join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate embeddings for each user based on the specified criteria
    const embeddings = await Promise.all(
      users.map(async (user) => {
        const inputText = user[criteria];

        // Generate the embedding using OpenAI API
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: inputText,
        });

        const embedding = response.data[0].embedding;

        return { ...user, embedding };
      })
    );

    // Return the embeddings as JSON
    return NextResponse.json(embeddings);
  } catch (error: any) {
    console.error('Error calculating embeddings:', error.message || error);

    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message || error },
      { status: 500 }
    );
  }
}
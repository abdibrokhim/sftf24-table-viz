// src/app/types.ts

export interface User {
    id: string;
    Name: string;
    Headshot: string;
    'Field of Study': string;
    Country: string;
    Interests: string;
    Impact: string;
    embedding: number[];
    // Add other fields as needed
  }
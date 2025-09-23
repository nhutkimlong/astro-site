import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getStore } from '@netlify/blobs';

// Netlify Blobs configuration
const dataStore = getStore('data-files');

// ESM-compatible dirname (avoid re-declaring __dirname)
const __FN_DIRNAME = dirname(fileURLToPath(import.meta.url));

// Read JSON file from Netlify Blobs
async function readJsonFile(fileName) {
  try {
    const data = await dataStore.get(fileName, { type: 'json' });
    if (data) {
      console.log(`Successfully read ${fileName} from Netlify Blobs`);
      return data;
    }
    throw new Error('File not found in Netlify Blobs');
  } catch (error) {
    console.error(`Error reading file ${fileName} from Netlify Blobs:`, error);
    throw error;
  }
}

// Write JSON file to Netlify Blobs
async function writeJsonFile(fileName, data) {
  try {
    await dataStore.setJSON(fileName, data);
    console.log(`Successfully wrote ${fileName} to Netlify Blobs`);
    return true;
  } catch (error) {
    console.error(`Error writing file ${fileName} to Netlify Blobs:`, error);
    throw error;
  }
}

// Fallback: Read JSON file from local filesystem
function readLocalJsonFile(fileName) {
  try {
    // Try different possible paths for data files
    const possiblePaths = [
      // Primary location: src/data during netlify dev
      join(process.cwd(), 'src', 'data', fileName),
      join(process.cwd(), '..', 'src', 'data', fileName),
      // Relative to this function file
      join(__FN_DIRNAME, '..', '..', 'src', 'data', fileName),
      join(__FN_DIRNAME, '..', '..', '..', 'src', 'data', fileName),
      // Fallback to old data directory
      join(process.cwd(), 'data', fileName),
      join(process.cwd(), '..', 'data', fileName),
    ];

    console.log('Trying to read file:', fileName);
    console.log('Current working directory:', process.cwd());
    console.log('Possible paths:', possiblePaths);

    for (const dataPath of possiblePaths) {
      try {
        console.log('Trying path:', dataPath);
        const content = readFileSync(dataPath, 'utf8');
        console.log('Successfully read file from:', dataPath);
        return JSON.parse(content);
      } catch (pathError) {
        console.log('Failed to read from:', dataPath, pathError.message);
        continue;
      }
    }

    // If all paths fail, return empty array as fallback
    console.warn(`File ${fileName} not found, returning empty array`);
    return [];
  } catch (error) {
    console.error(`Error reading local file ${fileName}:`, error);
    return [];
  }
}

// Fallback: Write JSON file to local filesystem
function writeLocalJsonFile(fileName, data) {
  try {
    // Path to local data files in src/data directory
    const dataPath = join(process.cwd(), 'src', 'data', fileName);
    const jsonString = JSON.stringify(data, null, 2);
    const fs = require('fs');
    fs.writeFileSync(dataPath, jsonString, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing local file ${fileName}:`, error);
    throw error;
  }
}


// Main handler function
export default async function handler(request, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  const method = request.method;
  if (method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers
    });
  }

  try {
    // Handle different ways query parameters might be passed
    const url = new URL(request.url);
    const file = url.searchParams.get('file');

    console.log('Requested file:', file);

    if (!file) {
      return new Response(JSON.stringify({
        error: 'File parameter is required',
        received: {
          url: request.url,
          method: request.method
        }
      }), {
        status: 400,
        headers
      });
    }

    // Validate file name for security
    const allowedFiles = [
      'POI.json',
      'Tours.json',
      'Accommodations.json',
      'Restaurants.json',
      'Specialties.json',
      'GioHoatDong.json'
    ];

    if (!allowedFiles.includes(file)) {
      return new Response(JSON.stringify({ error: 'Access denied to this file' }), {
        status: 403,
        headers
      });
    }

    // Handle HEAD request - return headers only with caching
    if (method === 'HEAD') {
      try {
        let data;
        try {
          data = await readJsonFile(file);
        } catch (blobError) {
          console.warn(`Netlify Blobs failed for ${file}, falling back to local file:`, blobError.message);
          data = readLocalJsonFile(file);
        }

        const body = JSON.stringify(data);
        const etag = 'W/"' + createHash('sha1').update(body).digest('base64') + '"';
        const cacheHeaders = {
          ...headers,
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
          'ETag': etag,
          'Vary': 'Accept-Encoding'
        };

        return new Response('', { status: 200, headers: cacheHeaders });
      } catch (error) {
        return new Response('', { status: 404, headers });
      }
    }

    // Handle GET request - read file
    if (method === 'GET') {
      try {
        let data;

        // Try Netlify Blobs first
        try {
          data = await readJsonFile(file);
        } catch (blobError) {
          console.warn(`Netlify Blobs failed for ${file}, falling back to local file:`, blobError.message);
          data = readLocalJsonFile(file);
        }

        // Strong caching with ETag support
        const body = JSON.stringify(data);
        const etag = 'W/"' + createHash('sha1').update(body).digest('base64') + '"';
        const reqETag = request.headers.get('if-none-match');

        const cacheHeaders = {
          ...headers,
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
          'ETag': etag,
          'Vary': 'Accept-Encoding'
        };

        if (reqETag && reqETag === etag) {
          return new Response('', {
            status: 304,
            headers: cacheHeaders
          });
        }

        return new Response(body, {
          status: 200,
          headers: cacheHeaders
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: `File ${file} not found` }), {
          status: 404,
          headers
        });
      }
    }

    // Handle POST request - write file
    if (method === 'POST') {
      try {
        const body = await request.json();

        // Try Netlify Blobs first
        try {
          await writeJsonFile(file, body);
        } catch (blobError) {
          console.warn(`Netlify Blobs failed for ${file}, falling back to local file:`, blobError.message);
          writeLocalJsonFile(file, body);
        }

        return new Response(JSON.stringify({
          success: true,
          message: `File ${file} updated successfully`
        }), {
          status: 200,
          headers
        });
      } catch (error) {
        throw error;
      }
    }

    // Handle unsupported methods
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers
    });
  }
}
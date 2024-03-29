import fetch, { RequestInit, RequestInfo, Headers, Response } from 'node-fetch';
import * as querystring from 'querystring';
import Credentials from '../credential';

export declare interface IHeaders {
  [key: string]: string;
}

// export fetch headers and response
export { Response };

export const defaultHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Accept: 'application/json'
};

export async function request(
  url: RequestInfo,
  init: RequestInit,
  credential: Credentials,
  autoParseJson: boolean = true,
  customResponseParser?: Function
) {
  try {
    init = Object.assign(
      // default init params
      {
        method: 'GET',
        headers: defaultHeaders
      },
      // override init params
      init
    );
    // ensure default headers is exist but not replaced
    init.headers = Object.assign({}, defaultHeaders, init.headers);
    // convert to Headers
    init.headers = new Headers(init.headers);

    if (credential.signatureSecret && credential.signatureMethod) {
      const splitPath = String(url).split(/\?(.+)/);
      const qs = splitPath[0];

      const params = querystring.decode(qs);

      // add timestamp if not already present
      if (Object.prototype.hasOwnProperty.call(params, 'timestamp')) {
        params.timestamp = String((new Date().getTime() / 1000) | 0); // floor to seconds
      }

      // strip API Secret
      delete params.api_secret;

      const hash = credential.generateSignature(params);

      let query = Object.keys(params)
        .sort()
        .reduce(function(query, key) {
          return `${query}&${key}=${params[key]}`;
        }, String(''));

      // replace the first & with ?
      query = query.replace(/&/i, '?');

      url = String(url).replace(qs, `${query}&sig=${hash}`);
    }

    console.info(
      'Request: %s \nMethod: %s \nHeaders: %o \nBody: %j',
      url,
      init.method,
      init.headers.raw(),
      init.body
    );

    // Response
    const response = await fetch(url, init);

    // pass to handler
    return await handleResponse(
      response,
      init,
      autoParseJson,
      customResponseParser
    );
  } catch (err) {
    console.error('problem with API request detailed stacktrace below ');
    console.error(err);
    throw err;
  }
}

export async function get(
  url: string,
  params: any,
  credential: Credentials,
  useJwt: boolean = false,
  useBasicAuth: boolean = false
) {
  params = params || {};

  if (!useJwt && !useBasicAuth) {
    params['api_key'] = credential.apiKey;
    params['api_secret'] = credential.apiSecret;
  }

  url = `${url}?${querystring.stringify(params)}`;

  const headers: IHeaders = {
    'Content-Type': 'application/json'
  };

  if (useJwt) {
    headers['Authorization'] = `Bearer ${credential.generateJwt()}`;
  }
  if (useBasicAuth) {
    headers['Authorization'] = `Basic ${Buffer.from(
      credential.apiKey + ':' + credential.apiSecret
    ).toString('base64')}`;
  }

  return request(
    url,
    {
      method: 'GET',
      headers: headers
    },
    credential
  );
}

export async function handleResponse(
  response: Response,
  request: RequestInit,
  autoParseJson: boolean = true,
  customResponseParser?: Function
) {
  let res: any = null;
  let error: any = null;

  try {
    const headers = response.headers;
    const contentType = headers.get('content-type');
    const statusCode = Number(response.status);
    if (statusCode >= 500) {
      error = {
        message: 'Server Error',
        statusCode: status
      };
    } else if (contentType === 'application/octet-stream') {
      // return buffer when it is octet-stream
      res = await response.buffer();
    } else if (statusCode === 429) {
      // 429 does not return a parsable body
      if (!headers.has('retry-after')) {
        // retry based on allowed per second
        const retryAfterMillis =
          request.method === 'POST' ? 1000 / 2 : 1000 / 5;
        headers.set('retry-after', String(retryAfterMillis));
      }
      error = {
        body: await response.text()
      };
    } else if (statusCode === 204) {
      // No content
      res = null;
    } else if (request.method !== 'DELETE') {
      // auto parse to json or be text
      if (autoParseJson) {
        res = await response.json();
      } else {
        res = await response.text();
      }
    } else {
      // default parse as buffer
      res = await response.buffer();
    }
  } catch (parseError) {
    console.error(parseError);
    console.error(
      'could not convert API response to JSON, above error is ignored and raw API response is returned to client'
    );
    console.error('Raw Error message from API ');
    console.error(`"${await response.buffer()}"`);

    error = {
      status: status,
      message: 'The API response could not be parsed.',
      body: await response.buffer(),
      parseError: parseError
    };
  }

  // use custom parser when it exist
  if (typeof customResponseParser === 'function') {
    // don't try to parse the response on errors
    if (response) {
      res = customResponseParser(response, request);
    }
  }

  // when error occur add nessary info and throw
  if (error) {
    error.statusCode = String(response.status);
    error.headers = response.headers;
    throw error;
  }

  // return response
  return res;
}

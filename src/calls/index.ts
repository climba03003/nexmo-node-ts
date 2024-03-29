import EndPoint, { NexmoHost } from '../endpoint';
import Credentials from '../credential';
import * as HTTPClient from '../utils/fetch';
import * as querystring from 'querystring';
import NexmoDtmf from './dtmf';
import NexmoStream from './stream';
import NexmoTalk from './talk';

export const NexmoCallsEndPoint = new EndPoint('api.nexmo.com', '/v1/calls');

export class NexmoCalls {
  credential: Credentials;
  options: INexmoCallsOptions;
  dtmf: NexmoDtmf;
  stream: NexmoStream;
  talk: NexmoTalk;

  static get ENDPOINT(): EndPoint {
    return NexmoCallsEndPoint;
  }

  static get RETRYPATHS(): Array<NexmoHost> {
    return ['api.nexmo.com', 'api-sg-1.nexmo.com', 'api-us-1.nexmo.com'];
  }

  constructor(
    credential: Credentials,
    options: INexmoCallsOptions = { retry: true, limit: 10 }
  ) {
    this.credential = credential;
    this.options = Object.assign({ retry: true, limit: 10 }, options);

    this.dtmf = new NexmoDtmf(credential, options);
    this.stream = new NexmoStream(credential, options);
    this.talk = new NexmoTalk(credential, options);
  }

  async create(
    params: INexmoCallsCreateParams
  ): Promise<INexmoCallsCreateResponse> {
    // update path according to default
    NexmoCalls.ENDPOINT.host = NexmoCalls.RETRYPATHS[0];

    // structure with default value
    params = Object.assign(
      {
        answer_method: 'GET',
        event_method: 'POST',
        length_timer: 7200,
        ringing_timer: 60
      },
      params
    );

    const body = JSON.stringify(params);
    const url = NexmoCalls.ENDPOINT.deserialize();

    return await HTTPClient.request(
      url,
      {
        method: 'POST',
        body: body,
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Length': Buffer.byteLength(params).toString(),
          Authorization: `Bearer ${this.credential.generateJwt()}`
        }
      },
      this.credential
    );
  }

  async get(
    query: INexmoCallsGetQuery | string,
    retry: number = 0
  ): Promise<INexmoCallsGetResponse | INexmoCallsObject> {
    try {
      if (!query) {
        throw new Error('"query" is a required parameter');
      }

      let pathExt = '';

      if (typeof query === 'string') {
        pathExt = `/${query}`;
      } else if (typeof query === 'object' && Object.keys(query).length > 0) {
        pathExt = `?${querystring.stringify(query as any)}`;
      }

      // update path according to retry
      NexmoCalls.ENDPOINT.host =
        NexmoCalls.RETRYPATHS[retry % NexmoDtmf.RETRYPATHS.length];

      const url = `${NexmoCalls.ENDPOINT.deserialize()}${pathExt}`;

      const res = await HTTPClient.request(
        url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.credential.generateJwt()}`
          }
        },
        this.credential
      );

      // Handle 404 Not Found
      // https://help.nexmo.com/hc/en-us/articles/115015969628-Why-do-I-get-a-404-when-trying-to-change-an-active-conversation-
      if (
        Object.prototype.hasOwnProperty.call(res, 'type') &&
        res.type === 'NOT_FOUND'
      ) {
        throw res;
      }

      return res;
    } catch (err) {
      console.warn(err);
      // throw error when try limit is exceed
      if (retry + 1 >= this.options.limit) {
        throw new Error(err.message || err);
      }
      // retry if enabled
      if (this.options.retry) {
        return await this.get(query, retry + 1);
      }
      // throw err when all condition is not match
      throw err;
    }
  }

  async update(
    callsId: string,
    params: INexmoCallsUpdateParams,
    retry: number = 0
  ): Promise<null> {
    try {
      // update path according to retry
      NexmoCalls.ENDPOINT.host =
        NexmoCalls.RETRYPATHS[retry % NexmoDtmf.RETRYPATHS.length];

      const body = JSON.stringify(params);
      const url = `${NexmoCalls.ENDPOINT.deserialize()}/${callsId}`;

      const res = await HTTPClient.request(
        url,
        {
          method: 'PUT',
          body: body,
          headers: {
            'Content-Type': 'application/json',
            // 'Content-Length': Buffer.byteLength(params).toString(),
            Authorization: `Bearer ${this.credential.generateJwt()}`
          }
        },
        this.credential
      );

      // Handle 404 Not Found
      // https://help.nexmo.com/hc/en-us/articles/115015969628-Why-do-I-get-a-404-when-trying-to-change-an-active-conversation-
      if (
        Object.prototype.hasOwnProperty.call(res, 'type') &&
        res.type === 'NOT_FOUND'
      ) {
        throw res;
      }

      return res;
    } catch (err) {
      console.warn(err);
      // throw error when try limit is exceed
      if (retry + 1 >= this.options.limit) {
        throw new Error(err.message || err);
      }
      // retry if enabled
      if (this.options.retry) {
        return await this.update(callsId, params, retry + 1);
      }
      // throw err when all condition is not match
      throw err;
    }
  }
}

export default NexmoCalls;

// Types Declaration
export declare interface INexmoCallsObject {
  _links: {
    self: {
      href: string;
    };
  };
  uuid: string;
  conversation_uuid: string;
  to:
    | INexmoCallsCreateToPSTN
    | INexmoCallsCreateToSIP
    | INexmoCallsCreateToWebsocket
    | INexmoCallsCreateToVBC;
  from: INexmoCallsCreateToPSTN;
  status: NexmoCallsType;
  direction: 'inbound' | 'outbound';
  rate: number;
  price: number;
  duration: number;
  start_time: string | Date;
  end_time: string | Date;
  network: number;
}

export declare type NexmoCallsType =
  | 'started'
  | 'ringing'
  | 'answered'
  | 'machine'
  | 'completed'
  | 'busy'
  | 'cancelled'
  | 'failed'
  | 'rejected'
  | 'timeout'
  | 'unanswered';

export declare interface INexmoCallsOptions {
  retry: boolean;
  limit: number;
}

export declare interface INexmoCallsCreateToPSTN {
  type: 'phone' | 'sip' | 'websocket' | 'vbc';
  number: string;
  dtmfAnswer?: string;
}

export declare interface INexmoCallsCreateToSIP {
  type: 'phone' | 'sip' | 'websocket' | 'vbc';
  uri: string;
}

export declare interface INexmoCallsCreateToWebsocket {
  type: 'phone' | 'sip' | 'websocket' | 'vbc';
  uri: string;
  'content-type': 'audio/l16;rate=8000' | 'audio/l16;rate=16000';
  headers: {
    customer_id: string;
  };
}

export declare interface INexmoCallsCreateToVBC {
  type: 'phone' | 'sip' | 'websocket' | 'vbc';
  extension: string;
}

export declare interface INexmoCallsCreateParams {
  to: Array<
    | INexmoCallsCreateToPSTN
    | INexmoCallsCreateToSIP
    | INexmoCallsCreateToWebsocket
    | INexmoCallsCreateToVBC
  >;
  from: INexmoCallsCreateToPSTN;
  ncco?: Array<string>;
  answer_url?: Array<string>;
  answer_method?: 'GET' | 'POST';
  event_url: Array<string>;
  event_method?: 'GET' | 'POST';
  machine_detection?: 'continue' | 'hangup';
  // 1 - 7200
  length_timer?: number;
  // 1 - 120
  ringing_timer?: number;
}

export declare interface INexmoCallsCreateResponse {
  uuid: string;
  status: 'started';
  direction: 'outbound';
  conversation_uuid: string;
}

export declare interface INexmoCallsGetQuery {
  status?: NexmoCallsType;
  date_start?: string | Date;
  date_end?: string | Date;
  page_size?: number;
  record_index?: number;
  order?: string;
  conversation_uuid?: string;
}

export declare interface INexmoCallsGetResponse {
  count: number;
  page_size: number;
  record_index: number;
  _links: {
    self: {
      href: string;
    };
  };
  _embedded: {
    calls: Array<INexmoCallsObject>;
  };
}

export declare interface INexmoCallsUpdateParams {
  action: 'hangup' | 'mute' | 'unmute' | 'earmuff' | 'unearmuff' | 'transfer';
  destination?: {
    type: 'ncco';
    url: Array<string>;
    ncco: Array<{
      [key: string]: string;
    }>;
  };
}

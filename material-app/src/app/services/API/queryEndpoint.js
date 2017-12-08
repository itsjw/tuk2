// @flow weak

import axios          from 'axios';
import {
  getMethod,
  jsonHeader,
  defaultOptions,
  getLocationOrigin
}                     from '../fetchTools';

export const queryEndpoint = (endpoint) => {
  const method  = getMethod.method;
  const headers = jsonHeader;
  const url     = `http://localhost:3001/${endpoint}`;
  const options = {...defaultOptions};

  return axios.request({
    method,
    url,
    ...headers,
    ...options
  })
  .then(data => data)
  .catch(error => Promise.reject(error));
};

// @flow weak

import axios          from 'axios';
import {
  getMethod,
  jsonHeader,
  defaultOptions,
  getLocationOrigin
}                     from '../fetchTools';

export const getMostCommonDiseasesByYearOfBirth = () => {
  const method  = getMethod.method;
  const headers = jsonHeader;
  const url     = `http://localhost:3001/most-common-diseases-by-year-of-birth`;
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

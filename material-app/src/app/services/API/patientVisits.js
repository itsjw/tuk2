// @flow weak

import axios from 'axios';
import { getMethod, jsonHeader, defaultOptions } from '../fetchTools';

export const getPatientVisits = () => {
  const method = getMethod.method;
  const headers = jsonHeader;
  const url = 'http://localhost:3001/patient-visits';
  const options = {...defaultOptions};
  return axios.request({ method, url, ...headers, ...options })
    .then(res => {
      if (res.status !== 200) return Promise.reject(res);
      return res.data;
    });
};
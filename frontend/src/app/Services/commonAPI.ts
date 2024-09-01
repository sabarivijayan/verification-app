import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

type HttpRequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

export const commonAPI = async (
  httpRequest: HttpRequestMethod,
  url: string,
  reqBody: any,
  reqHeader?: Record<string, string>
): Promise<AxiosResponse<any>> => {
  const reqConfig: AxiosRequestConfig = {
    method: httpRequest,
    url,
    data: reqBody,
    headers: reqHeader ? reqHeader : { "Content-Type": "application/json" },
    withCredentials: true,
  };

  try {
    const response = await axios(reqConfig);
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

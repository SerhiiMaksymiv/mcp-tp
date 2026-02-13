import { TpClientParameters } from "../types/tp.client.js"

export class TpClient {

  private baseUrl: string
  private token: string
  private headers: HeadersInit

  constructor(tpConfig: { baseUrl: string, version?: string, token: string, }) {
    this.baseUrl = tpConfig.baseUrl + (tpConfig.version || "v1")
    this.token = tpConfig.token
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  }

  private params(params: TpClientParameters): string {
    let _url = this.baseUrl
    for (const [key, value] of Object.entries(params.pathParam)) {
      _url += `/${key}/${value}`
    }

    let _urlParams = []
    for (const [key, value] of Object.entries(params.param)) {
      _urlParams.push(`${key}=${value}`)
    }

    return _url + "/?" + _urlParams.join("&")
  }

  async get<T>(params: TpClientParameters): Promise<T | null> {
    params.param["access_token"] = this.token
    let _url = this.params(params)
    try {
      const response = await fetch(_url, {
        method: "GET",
        headers: this.headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as T
    } catch (error) {
      console.error("Error making TP request:", error);
      return null;
    }
  }

  async post<T, U>(params: TpClientParameters, data: U): Promise<T | null> {
    params.param["access_token"] = this.token
    let _url = this.params(params)
    try {
      const response = await fetch(_url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error("Error making TP request:", error);
      return null;
    }
  }
}

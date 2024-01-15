import { BaseKey, DataProvider } from "@refinedev/core";
import { axiosInstance, generateSort, generateFilter } from "./utils";
import { AxiosInstance } from "axios";
import { stringify } from "query-string";

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

export const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${apiUrl}/`;

    const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};

    const { headers: headersFromMeta, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const queryFilters = generateFilter(filters);
    const generatedSort = generateSort(sorters);

    const query: {
      startindex?: number;
      count?: number;
      service: string;
      request: string;
      version: string;
      outputformat: string;
      typenames: string;
      sortby: string;
      cql_filter?: string;
    } = {service:'WFS', request: 'GetFeature', sortby : '', version:'2.0.0', outputformat:'application/json', typenames: resource};

    if (mode === "server") {
      query.startindex = (current - 1) * pageSize;
      query.count = pageSize;
    }

    if (generatedSort) {
      query.sortby = generatedSort;
    }

    if (queryFilters) {
      query.cql_filter=queryFilters
    }

    const { data, headers } = await httpClient[requestMethod](
      `${url}?${stringify({...query, sortby : undefined})}&sortby=${query.sortby}&`, //"le + de sortby ne doit pas être urlencode"
      {
        headers: headersFromMeta,
      }
    );

    const features: any[] = data.features.map((feature:any) => 
        { const { properties, type, ...rest } = feature; //Remonter d'un niveau les properties, supprimer root.type
        return { ...rest, ...properties };}
    )

    return {
      data: features, 
      total: data.numberMatched,
    };
  },

  getMany: async ({ resource, ids, meta }) => {
    const url = `${apiUrl}`;

    const query: {
      featureid: BaseKey[];
      service: string;
      request: string;
      version: string;
      outputformat: string;
      typenames: string;
    } = {service:'WFS', request: 'GetFeature', featureid: ids, version:'2.0.0', outputformat:'application/json', typenames: resource};

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const { data } = await httpClient[requestMethod](
      `${url}?${stringify({...query, featureid:ids.join(',')})}`,
      { headers }
    );

    const feature: any[] = data.features.map((feature:any) => 
      { const { properties, type, ...rest } = feature; //Remonter d'un niveau les properties, supprimer root.type
      return { ...rest, ...properties };}
    )

    return {
      data : feature,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "post";

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "patch";

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}`;

    const query: {
      featureid: BaseKey;
      service: string;
      request: string;
      version: string;
      outputformat: string;
      typenames: string;
    } = {service:'WFS', request: 'GetFeature', featureid: id, version:'2.0.0', outputformat:'application/json', typenames: resource};

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const { data } = await httpClient[requestMethod](
      `${url}?${stringify(query)}`,
      { headers }
    );

    const feature = (() => {
        { const { properties, type, ...rest } = data.features[0]; //Remonter d'un niveau les properties, supprimer root.type
        return { ...rest, ...properties };}
    })()

    return {
      data : feature,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "delete";

    const { data } = await httpClient[requestMethod](url, {
      data: variables,
      headers,
    });

    return {
      data,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
    headers,
  }) => {
    let requestUrl = `${url}?`;

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;
        const sortQuery = {
          _sort: _sort.join(","),
          _order: _order.join(","),
        };
        requestUrl = `${requestUrl}&${stringify(sortQuery)}`;
      }
    }

    if (filters) {
      const filterQuery = generateFilter(filters);
      requestUrl = `${requestUrl}&${stringify(filterQuery)}`;
    }

    if (query) {
      requestUrl = `${requestUrl}&${stringify(query)}`;
    }

    let axiosResponse;
    switch (method) {
      case "put":
      case "post":
      case "patch":
        axiosResponse = await httpClient[method](url, payload, {
          headers,
        });
        break;
      case "delete":
        axiosResponse = await httpClient.delete(url, {
          data: payload,
          headers: headers,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl, {
          headers,
        });
        break;
    }

    const { data } = axiosResponse;

    return Promise.resolve({ data });
  },
});

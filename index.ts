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

    const {cql_filter:queryFilters, bbox} = generateFilter(filters);
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
      bbox?:string;
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

    if (bbox !==''){
      query.bbox=bbox
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

  getApiUrl: () => {
    return apiUrl;
  },

  create: async ({ resource, variables, meta }) => {
    throw new Error(
      `[wfs-data-provider]: create operation not supported`
      );
  },

  update: async ({ resource, id, variables, meta }) => {
    throw new Error(
      `[wfs-data-provider]: update operation not supported`
      );
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    throw new Error(
      `[wfs-data-provider]: delete operation not supported`
      );
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
    throw new Error(
      `[wfs-data-provider]: custom query operation not supported`
      ); 
  }
});

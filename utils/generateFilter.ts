import { CrudFilters } from "@refinedev/core";
import { mapOperator } from "./mapOperator";

export const generateFilter = (filters?: CrudFilters) => {
  const array_filter: string[] = []

  if (filters) {
    filters.map((filter) => {

      if (filter.operator !== "or" && filter.operator !== "and" && "field" in filter){ // LogicalFilter
        const mappedOperator = mapOperator(filter.operator);

        const value = (() => {switch (filter.operator){
          case "contains":
          case "containss":
          case "ncontains":
          case "ncontainss":
            return  `'%${filter.value}%'`
          case "startswith":
          case "startswiths":
          case "nstartswith":
          case "nstartswiths":
            return  `'${filter.value}%'`
          case "endswith":
          case "endswiths":
          case "nendswith":
          case "nendswiths":
            return  `'%${filter.value}'`
          case "in":
            return `(${filter.value.map((i:string) => `'${i}'`).join(',')})`
          default:
            return `'${filter.value}'`
        }})()
        array_filter.push( `${filter.field} ${mappedOperator} ${value}`)

      }else{ //Conditionnal filter
        throw new Error(
          `[wfs-data-provider]: Condtionnal filter 'OR' not implemented yet `
          ); 
      }

    });
  }

  return array_filter.join(' and ');
};

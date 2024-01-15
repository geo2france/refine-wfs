import { CrudOperators } from "@refinedev/core";

export const mapOperator = (operator: CrudOperators): string => {
  switch (operator) {
    case "ne":
      return '<>'
    case "gte":
      return '>='
    case "gt":
      return '>'
    case "lte":
      return `<=`;
    case "lt":
      return `<`;
    case "eq":
      return "="
    case "contains":
    case "startswith":
    case "endswith":
      return "ilike";
    case "containss":
    case "startswiths":
    case "endswiths":
      return "like";
    case "ncontains":
    case "nstartswith":
    case "nendswith":
      return "not ilike"
    case "ncontains":
    case "nstartswiths":
    case "nendswiths":
      return "not like"
    case "in":
      return operator
    default:
      return "";
  }
};

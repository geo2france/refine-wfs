# wfs-data-provider

## CRUD

Only read operations are supported (pagination, sorters, getlist, getone, getmany).

## Supported filters operators
- `ne`
- `gte`
- `gt`
- `lte`
- `lt`
- `eq`
- `contains`
- `startswith`
- `endswith`
- `containss`
- `startswiths`
- `endswiths`
- `ncontains`
- `nstartswith`
- `nendswith`
- `ncontainss`
- `nstartswiths`
- `nendswiths`
- `in`

In combination with `geometry` field, the `in` operator is used to specify the _bounding box_.
Otherwith, it is used to check if field is included in array.
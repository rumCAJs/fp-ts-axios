# fp-ts Axios

Basic helpers for axios usage in fp-ts

## Basic usage

```ts
import { pipe } from 'fp-ts/lib/function'
import { post, get, put, del } from '@polena/fp-ts-axios'
import * as TE from 'fp-ts/TaskEither'

// base get request with search paramateres as second parameter
pipe(
	get<{ data: null }>(
		'/some/api',
		// searh parameters
		{
			searchParam: '',
		}
	),
	TE.match(
		// e -> NetworkError
		(e) => console.error(e),
		// response -> typed as {data: null}
		(response) => console.log(response)
	),
	(run) => run()
)

// it is possible to pass down additional request config options and axios instance for current request only
get<{ data: null }>(
	'/some/api',
	{
		searchParam: '',
	},
	// custom request config for current request - available for every method
	{ headers: { 'X-Custom-Header': 'foobar' } },
	// custom axios instance for current request - available for every method
	axios.create
)

// post, put and delete methods has body as second parameter
post<{ data: string }>(
	'/some/post/api',
	// request body
	{
		filter: {},
	}
)
```

## Axios instance configuration

- it is possible to configure global axios instance for usage on every request

```ts
import { pipe } from 'fp-ts/lib/function'
import { post, get, put, del, configureAxios } from '@polena/fp-ts-axios'
import * as TE from 'fp-ts/TaskEither'

// configure global axios instance for every request
configureAxios({
	baseURL: 'https://some-domain.com/api/',
	timeout: 1000,
	headers: { 'X-Custom-Header': 'foobar' },
})

pipe(
	get<{ data: null }>('/some/api', {}),
	TE.match(
		// e -> NetworkError
		(e) => console.error(e),
		// response -> {data: null}
		(response) => console.log(response)
	),
	(run) => run()
)
```

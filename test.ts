import { pipe } from 'fp-ts/lib/function'
import { post, get, put, del, configureAxios } from '.'
import * as TE from 'fp-ts/TaskEither'

// configure global axios instance for every request

pipe(
  post<{ data: null }>(
    'http://localhost:3000/api/chart-data',
    {},
    { headers: { 'X-Custom-Header': 'asdasdsa' } }
  ),
  TE.match(
    // e -> NetworkError
    (e) => console.error(e),
    // response -> {data: null}
    (response) => console.log(response)
  ),
  (run) => run()
)

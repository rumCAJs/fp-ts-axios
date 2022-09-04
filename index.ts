import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { identity, pipe } from 'fp-ts/lib/function'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

export interface NetworkError {
	type: 'NetworkError'
	message: string
	code: number
	url: string
}

let _axios: O.Option<AxiosInstance> = O.none

export const configureAxios = (opts?: AxiosRequestConfig) => pipe(
	axios.create(opts),
	(a) => {
		_axios = O.fromNullable(a)
		return a
	}
)

const getAxios = (): AxiosInstance => pipe(
	_axios,
	O.match(
		configureAxios,
		identity
	)
)

const request = <Response extends {}>(
	method: 'get' | 'post' | 'put' | 'delete',
	url: string,
	opts?: object
): TE.TaskEither<NetworkError, Response> => {
	return pipe(
		TE.tryCatch(
			() => {
				//TODO: rewrite :)
				switch (method) {
					case 'post':
						return axios.post<Response>(url, opts)
					default:
					case 'get':
						return axios.get<Response>(url, opts)
				}
			},
			(reason) => {
				const error = reason as AxiosError
				return {
					code: error?.response?.status || 500,
					message: error?.response?.statusText || '',
					type: 'NetworkError',
					url,
				} as NetworkError
			}
		),
		TE.map((res) => res.data)
	)
}

export const get = <Response extends {}>(
	url: string,
	opts?: object
): TE.TaskEither<NetworkError, Response> => {
	return request('get', url, { params: opts })
}

export const post = <Response extends {}>(
	url: string,
	opts?: object
): TE.TaskEither<NetworkError, Response> => {
	return request('post', url, opts)
}

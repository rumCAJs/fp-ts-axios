import { TaskEither, map as mapTE, tryCatch } from 'fp-ts/TaskEither'
import { Option, none, fromNullable, match as matchO } from 'fp-ts/Option'
import { identity, pipe } from 'fp-ts/lib/function'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

export interface NetworkError {
	type: 'NetworkError'
	message: string
	code: number
	url: string
}

let _axios: Option<AxiosInstance> = none

/**
 * configure default axios instance used by all methods (set auth token, etc.)
 * @param [opts] AxiosRequestConfig
 * @returns AxiosInstance
 */
export const configureAxios = (opts?: AxiosRequestConfig) =>
	pipe(axios.create(opts), (a) => {
		_axios = fromNullable(a)
		return a
	})

const getAxios = (): AxiosInstance =>
	pipe(_axios, matchO(configureAxios, identity))

const request = <Response extends {}>(
	requestConfig: AxiosRequestConfig,
	customInstance?: AxiosInstance
): TaskEither<NetworkError, Response> => {
	const axiosInstance = pipe(
		fromNullable(customInstance),
		matchO(getAxios, identity)
	)

	return pipe(
		tryCatch(
			() => {
				return axiosInstance(requestConfig)
			},
			(reason) => {
				const error = reason as AxiosError
				return {
					code: error?.response?.status || 500,
					message: error?.response?.statusText || '',
					type: 'NetworkError',
					url: requestConfig.url,
				} as NetworkError
			}
		),
		mapTE((res) => res.data as Response)
	)
}

const makeMethod =
	(method: 'post' | 'put' | 'delete') =>
	<Response extends {}>(
		url: string,
		body: object,
		conf?: AxiosRequestConfig,
		customInstance?: AxiosInstance
	) =>
		request<Response>(
			{
				...conf,
				url,
				method,
				data: body,
			},
			customInstance
		)

/**
 * GET request with given params
 * @param url
 * @param [params] url search parameters
 * @param [conf] optional AxiosRequestConfig
 * @param [customInstance] custom Axios instance used for this request only
 * @returns TaskEither<NetworkError, Response>
 */
export const get = <Response extends {}>(
	url: string,
	params?: object,
	conf?: AxiosRequestConfig,
	customInstance?: AxiosInstance
): TaskEither<NetworkError, Response> =>
	request<Response>({ ...conf, method: 'get', url, params }, customInstance)

/**
 * POST request with given body
 * @param url
 * @param body request body
 * @param [conf] optional AxiosRequestConfig
 * @param [customInstance] custom Axios instance used for this request only
 * @returns TaskEither<NetworkError, Response>
 */
export const post = makeMethod('post')

/**
 * PUT request with given body
 * @param url
 * @param body request body
 * @param [conf] optional AxiosRequestConfig
 * @param [customInstance] custom Axios instance used for this request only
 * @returns TaskEither<NetworkError, Response>
 */
export const put = makeMethod('put')

/**
 * DELETE request with given body
 * @param url
 * @param body request body
 * @param [conf] optional AxiosRequestConfig
 * @param [customInstance] custom Axios instance used for this request only
 * @returns TaskEither<NetworkError, Response>
 */
export const del = makeMethod('delete')

const methods = {
	get,
	post,
	put,
	del,
} as const

export default methods

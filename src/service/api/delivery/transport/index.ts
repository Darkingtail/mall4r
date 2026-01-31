import { type HttpClient, httpClient } from "@/service";

export interface TransfeeFree {
	transfeeFreeId?: number;
	transportId?: number;
	freeType: number; // 0:按件数 1:按金额
	amount: number;
	piece: number;
	cityId?: number;
	city?: string;
}

export interface Transfee {
	transfeeId?: number;
	transportId?: number;
	cityId?: number;
	city?: string;
	firstPiece: number;
	firstFee: number;
	continuousPiece: number;
	continuousFee: number;
}

export interface Transport {
	transportId?: number;
	transName: string;
	chargeType: number; // 0:按件数 1:按重量
	isFreeFee: number; // 0:不包邮 1:包邮
	hasFreeCondition: number; // 0:无条件 1:有条件
	transfees?: Transfee[];
	transfeeFrees?: TransfeeFree[];
}

export interface FetchTransportPageRequest {
	current: number;
	size: number;
	transName?: string;
}

export interface FetchTransportPageResponse {
	current: number;
	pages: number;
	records: Transport[];
	size: number;
	total: number;
}

const TRANSPORT_BASE_PATH = "/shop/transport";

export function createTransportApi(client: HttpClient = httpClient) {
	return {
		fetchPage(
			params: FetchTransportPageRequest,
		): Promise<FetchTransportPageResponse> {
			const urlParams = Object.entries(params)
				.map(([key, value]) => {
					if (value === undefined || value === null || value === "") {
						return "";
					}
					return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
				})
				.filter(Boolean)
				.join("&");

			const url = urlParams
				? `${TRANSPORT_BASE_PATH}/page?${urlParams}`
				: `${TRANSPORT_BASE_PATH}/page`;
			return client.get<FetchTransportPageResponse, FetchTransportPageResponse>(
				url,
			);
		},
		list(): Promise<Transport[]> {
			return client.get<Transport[], Transport[]>(`${TRANSPORT_BASE_PATH}/list`);
		},
		getById(transportId: number): Promise<Transport> {
			return client.get<Transport, Transport>(
				`${TRANSPORT_BASE_PATH}/info/${transportId}`,
			);
		},
		add(data: Transport): Promise<void> {
			return client.post(TRANSPORT_BASE_PATH, data);
		},
		update(data: Transport): Promise<void> {
			return client.put(TRANSPORT_BASE_PATH, data);
		},
		delete(transportId: number): Promise<void> {
			return client.delete(`${TRANSPORT_BASE_PATH}/${transportId}`);
		},
	};
}

export const transportApi = createTransportApi();
